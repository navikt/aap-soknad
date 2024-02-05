import { beskyttetApi } from 'auth/beskyttetApi';
import {
  getAccessTokenFromRequest,
  isMock,
  logger,
  tokenXApiProxy,
} from '@navikt/aap-felles-utils';
import { NextApiRequest, NextApiResponse } from 'next';
import metrics from 'utils/metrics';
import { ErrorMedStatus } from 'auth/ErrorMedStatus';
import { isLabs } from 'utils/environments';
import { slettBucket } from 'pages/api/buckets/slett';
import { randomUUID } from 'crypto';
import { createIntl } from 'react-intl';
import { flattenMessages, messages } from 'utils/message';
import links from 'translations/links.json';
import { Soknad } from 'types/Soknad';
import { mapSøknadToBackend, mapSøknadToPdf } from 'utils/api';
import { SøknadBackendState } from 'types/SoknadBackendState';
import { getAndreUtbetalingerSchema } from 'components/pageComponents/standard/AndreUtbetalinger/AndreUtbetalinger';
import { getBehandlerSchema } from 'components/pageComponents/standard/Behandlere/EndreEllerLeggTilBehandlerModal';
import { getMedlemskapSchema } from 'components/pageComponents/standard/Medlemskap/medlemskapSchema';
import { getStartDatoSchema } from 'components/pageComponents/standard/StartDato/StartDato';
import { getStudentSchema } from 'components/pageComponents/standard/Student/Student';
import { getYrkesskadeSchema } from 'components/pageComponents/standard/Yrkesskade/Yrkesskade';

const SOKNAD_VERSION = 0;

// TODO: Sjekke om vi må generere pdf på samme språk som bruker har valgt når de fyller ut søknaden
function getIntl() {
  return createIntl({
    locale: 'nb',
    messages: { ...messages['nb'], ...flattenMessages({ applinks: links }) },
  });
}

// TODO: Denne tar vi i bruk når vi går live med ny innsending
interface SoknadInnsendingRequestBody {
  kvittering?: Record<string, unknown>;
  soknad: Soknad & { version: number };
  filer: Array<Fil>;
}

interface SoknadApiInnsendingRequestBody {
  kvittering?: Record<string, unknown>;
  soknad: SøknadBackendState;
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

  logger.info('Resultater fra validering av søknad' + validationResults.join(', '));

  return validationResults.filter((result) => !result).length === 0;
};

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const accessToken = getAccessTokenFromRequest(req);

  const søknad = req.body as Soknad;

  /* TODO: Dette må vi mappe når vi tar i bruk ny innsending
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
 */

  if (!søknadIsValid(søknad)) {
    res.status(400).json({ errorMessage: 'Søknaden er ikke gyldig' });
    return;
  }

  const { formatMessage } = getIntl();
  const søknadPdf = mapSøknadToPdf(søknad, new Date(), formatMessage, []);
  const søknadJson = mapSøknadToBackend(søknad);

  try {
    const soknadRes = await sendSoknad({ soknad: søknadJson, kvittering: søknadPdf }, accessToken);
    metrics.sendSoknadCounter.inc({ type: 'STANDARD' });
    res.status(201).json(soknadRes);
  } catch (err) {
    if (err instanceof ErrorMedStatus) {
      res.status(err.status).json({ navCallId: err.navCallId });
    } else {
      throw err;
    }
  }
});

export const sendSoknad = async (data: SoknadApiInnsendingRequestBody, accessToken?: string) => {
  // TODO: Denne brukes av playwright. Se om vi skal gjøre endringer her på sikt
  if (isLabs()) {
    return { uri: `https://localhost:3000/aap/soknad/api/vedlegg/les?uuid=${randomUUID()}` };
  }
  if (isMock()) {
    await slettBucket('STANDARD', accessToken);
    return { uri: `https://localhost:3000/aap/soknad/api/vedlegg/les?uuid=${randomUUID()}` };
  }
  const søknad = await tokenXApiProxy({
    url: `${process.env.SOKNAD_API_URL}/innsending/soknad`,
    prometheusPath: 'innsending/soknad',
    method: 'POST',
    data: JSON.stringify(data),
    audience: process.env.SOKNAD_API_AUDIENCE!,
    bearerToken: accessToken,
    metricsStatusCodeCounter: metrics.backendApiStatusCodeCounter,
    metricsTimer: metrics.backendApiDurationHistogram,
    logger: logger,
  });
  return søknad;
};

export default handler;
