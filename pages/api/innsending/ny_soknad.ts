import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { beskyttetApi } from 'auth/beskyttetApi';
import { tokenXApiProxy, logger } from '@navikt/aap-felles-utils';
import { isMock } from 'utils/environments';
import { slettBucket } from '../buckets/slett';
import { ErrorMedStatus } from 'auth/ErrorMedStatus';
import metrics from 'utils/metrics';
import { Soknad } from 'types/Soknad';
import { getStartDatoSchema } from 'components/pageComponents/standard/StartDato/StartDato';
import { getAndreUtbetalingerSchema } from 'components/pageComponents/standard/AndreUtbetalinger/AndreUtbetalinger';
import { getBarnetillegSchema } from 'components/pageComponents/standard/Barnetillegg/Barnetillegg';
import { getMedlemskapSchema } from 'components/pageComponents/standard/Medlemskap/medlemskapSchema';
import { getStudentSchema } from 'components/pageComponents/standard/Student/Student';
import { getYrkesskadeSchema } from 'components/pageComponents/standard/Yrkesskade/Yrkesskade';
import { getBehandlerSchema } from 'components/pageComponents/standard/Behandlere/Behandlere';
import { createIntl } from 'react-intl';
import { flattenMessages, messages } from 'utils/message';
import links from 'translations/links.json';
import { mapSøknadToPdf } from 'utils/api';

interface SoknadInnsendingRequestBody {
  kvittering?: Record<string, unknown>;
  filer: Array<{
    id: string;
    tittel: string;
  }>;
}

function getIntl() {
  return createIntl({
    locale: 'nb',
    messages: { ...messages['nb'], ...flattenMessages({ applinks: links }) },
  });
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
    getBehandlerSchema(formatMessage).isValidSync(søknad),
    getBarnetillegSchema(formatMessage).isValidSync(søknad),
    getStudentSchema(formatMessage).isValidSync(søknad.student),
    getAndreUtbetalingerSchema(formatMessage).isValidSync(søknad.andreUtbetalinger),
  ];

  return validationResults.filter((result) => !result).length === 0;
};

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const accessToken = getAccessTokenFromRequest(req);

  const søknad: Soknad = req.body;

  const erGyldig = søknadIsValid(søknad);

  if (!erGyldig) {
    res.status(400).json({ errorMessage: 'Søknaden er ikke gyldig' });
    return;
  }

  const { formatMessage } = getIntl();

  const søknadPdf = mapSøknadToPdf(søknad, new Date(), formatMessage, []);

  try {
    const soknadRes = await sendSoknad({ kvittering: søknadPdf, filer: [] }, accessToken);
    metrics.sendSoknadCounter.inc({ type: 'STANDARD' });
    res.status(201).json(soknadRes);
  } catch (err) {
    throw err;
  }
});

export const sendSoknad = async (innsending: SoknadInnsendingRequestBody, accessToken?: string) => {
  if (isMock()) {
    await slettBucket('STANDARD', accessToken);
  }
  const søknad = await tokenXApiProxy({
    url: `${process.env.INNSENDING_API_URL}/innsending`,
    prometheusPath: 'innsending/soknad',
    method: 'POST',
    data: JSON.stringify(innsending),
    audience: process.env.INNSENDING_API_AUDIENCE!,
    bearerToken: accessToken,
    metricsStatusCodeCounter: metrics.backendApiStatusCodeCounter,
    metricsTimer: metrics.backendApiDurationHistogram,
    logger: logger,
    noResponse: true,
  });
  return søknad;
};

export default handler;
