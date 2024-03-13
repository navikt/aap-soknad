import { beskyttetApi } from 'auth/beskyttetApi';
import { logError, tokenXApiProxy } from '@navikt/aap-felles-utils';
import { NextApiRequest, NextApiResponse } from 'next';
import metrics from 'utils/metrics';
import { ErrorMedStatus } from 'auth/ErrorMedStatus';
import { isFunctionalTest, isMock } from 'utils/environments';
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
import { SOKNAD_VERSION } from 'context/soknadcontext/soknadContext';

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
            tittel: mapVedleggTypeTilVedleggTekst(key),
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
    logError(`Noe gikk galt ved innsending av søknad`, err);

    if (err instanceof ErrorMedStatus) {
      res.status(err.status).json({ navCallId: err.navCallId });
    } else {
      throw err;
    }
  }
});

function mapVedleggTypeTilVedleggTekst(vedleggType: AttachmentType): string {
  switch (vedleggType) {
    case 'LØNN_OG_ANDRE_GODER':
      return 'Dokumentasjon om lønn og andre goder';
    case 'OMSORGSSTØNAD':
      return 'Dokumentasjon om omsorgsstønad';
    case 'UTLANDSSTØNAD':
      return 'Dokumentasjon om utenlandsstønad';
    case 'SYKESTIPEND':
      return 'Dokumentasjon om sykestipend';
    case 'LÅN':
      return 'Dokumentasjon om lån';
    case 'AVBRUTT_STUDIE':
      return 'Dokumentasjon om avbrutt studie';
    case 'ANNET':
      return 'Annen dokumentasjon';
    default:
      return 'Dokumentasjon om barn eller fosterbarn';
  }
}

export const sendSoknadViaAapInnsending = async (
  innsending: SoknadInnsendingRequestBody,
  accessToken?: string,
) => {
  if (isFunctionalTest()) {
    return 'Vi har mottat søknaden din.';
  }
  if (isMock()) {
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
    noResponse: true,
  });
  return søknad;
};

export default handler;
