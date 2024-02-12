import { beskyttetApi } from 'auth/beskyttetApi';
import { logger, tokenXApiProxy } from '@navikt/aap-felles-utils';
import { NextApiRequest, NextApiResponse } from 'next';
import metrics from 'utils/metrics';
import { ErrorMedStatus } from 'auth/ErrorMedStatus';
import { isLabs, isMock } from 'utils/environments';
import { slettBucket } from 'pages/api/buckets/slett';
import { createIntl } from 'react-intl';
import { flattenMessages, messages } from 'utils/message';
import links from 'translations/links.json';
import { Soknad } from 'types/Soknad';
import { mapSøknadToPdf } from 'utils/api';
import { getAndreUtbetalingerSchema } from 'components/pageComponents/standard/AndreUtbetalinger/AndreUtbetalinger';
import { getBehandlerSchema } from 'components/pageComponents/standard/Behandlere/EndreEllerLeggTilBehandlerModal';
import { getMedlemskapSchema } from 'components/pageComponents/standard/Medlemskap/medlemskapSchema';
import { getStartDatoSchema } from 'components/pageComponents/standard/StartDato/StartDato';
import { getStudentSchema } from 'components/pageComponents/standard/Student/Student';
import { getYrkesskadeSchema } from 'components/pageComponents/standard/Yrkesskade/Yrkesskade';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { AttachmentType, RequiredVedlegg } from 'types/SoknadContext';

const SOKNAD_VERSION = 0;

// TODO: Sjekke om vi må generere pdf på samme språk som bruker har valgt når de fyller ut søknaden
function getIntl() {
  return createIntl({
    locale: 'nb',
    messages: { ...messages['nb'], ...flattenMessages({ applinks: links }) },
  });
}

interface SoknadInnsending extends Soknad {
  version: number;
  etterspurtDokumentasjon: AttachmentType[];
}

interface SoknadInnsendingRequestBody {
  kvittering?: Record<string, unknown>;
  soknad: SoknadInnsending;
  filer: Array<Fil>;
}

interface Fil {
  id: string;
  tittel: string;
}

const søknadIsValid = (søknad: Soknad) => {
  const { formatMessage } = getIntl();

  const validationResults = [
    getStartDatoSchema(formatMessage).isValidSync({
      sykepenger: søknad.sykepenger,
      ferie: søknad.ferie,
    }),
    getMedlemskapSchema(formatMessage).isValidSync(søknad),
    getYrkesskadeSchema(formatMessage).isValidSync(søknad),
    getStudentSchema(formatMessage).isValidSync(søknad.student),
    getAndreUtbetalingerSchema(formatMessage).isValidSync(søknad.andreUtbetalinger),
  ];

  if (søknad.andreBehandlere) {
    søknad.andreBehandlere.forEach((behandler) => {
      validationResults.push(getBehandlerSchema(formatMessage).isValidSync(behandler));
    });
  }

  return validationResults.filter((result) => !result).length === 0;
};

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const accessToken = getAccessTokenFromRequest(req);

  const { søknad, requiredVedlegg } = req.body as {
    søknad: Soknad;
    requiredVedlegg: RequiredVedlegg[];
  };

  const filer: Fil[] = Object.keys(søknad.vedlegg ?? {})
    .map((key) => {
      const vedleggArray = søknad?.vedlegg?.[key];
      const filerArray: Fil[] =
        vedleggArray?.map((vedlegg) => {
          return {
            id: vedlegg.vedleggId,
            tittel: vedlegg.name,
          };
        }) ?? [];

      return filerArray;
    })
    .flat();

  const etterspurtDokumentasjon = requiredVedlegg?.map((vedlegg) => vedlegg.type);

  if (!søknadIsValid(søknad)) {
    res.status(400).json({ errorMessage: 'Søknaden er ikke gyldig' });
    return;
  }

  const { formatMessage } = getIntl();
  const søknadPdf = mapSøknadToPdf(søknad, new Date(), formatMessage, []);

  try {
    await sendSoknadViaAapInnsending(
      {
        soknad: { ...søknad, version: SOKNAD_VERSION, etterspurtDokumentasjon },
        kvittering: søknadPdf,
        filer,
      },
      accessToken,
    );

    metrics.sendSoknadCounter.inc({ type: 'STANDARD' });
    res.status(201).send('Vi har mottat søknaden');
  } catch (err) {
    logger.error(`Noe gikk galt ved innsending av søknad: ${err?.toString()}`);

    if (err instanceof ErrorMedStatus) {
      res.status(err.status).json({ navCallId: err.navCallId });
    } else {
      throw err;
    }
  }
});

export const sendSoknadViaAapInnsending = async (
  innsending: SoknadInnsendingRequestBody,
  accessToken?: string,
) => {
  if (isLabs()) {
    return 'Vi har mottat søknaden din.';
  }
  if (isMock()) {
    await slettBucket('STANDARD', accessToken);
    return 'Vi har mottat søknaden din.';
  }
  const søknad = await tokenXApiProxy({
    url: `${process.env.INNSENDING_URL}/innsending`,
    prometheusPath: 'innsending/soknad',
    method: 'POST',
    data: JSON.stringify(innsending),
    audience: process.env.INNSENDING_AUDIENCE!,
    bearerToken: accessToken,
    metricsStatusCodeCounter: metrics.backendApiStatusCodeCounter,
    metricsTimer: metrics.backendApiDurationHistogram,
    logger: logger,
    noResponse: true,
  });
  return søknad;
};

export default handler;
