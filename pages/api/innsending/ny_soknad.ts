import { randomUUID } from 'crypto';
import { NextApiRequest, NextApiResponse } from 'next';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { beskyttetApi } from 'auth/beskyttetApi';
import { tokenXApiProxy, logger } from '@navikt/aap-felles-utils';
import { isMock, isLabs } from 'utils/environments';
import { slettBucket } from '../buckets/slett';
import metrics from 'utils/metrics';
import { Soknad } from 'types/Soknad';
import { mapSøknadToPdf } from 'utils/api';
import { createIntl } from 'react-intl';
import { flattenMessages, messages } from 'utils/message';
import links from 'translations/links.json';

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

const handler = beskyttetApi(async (req: NextApiRequest, res: NextApiResponse) => {
  const accessToken = getAccessTokenFromRequest(req);

  const søknad: Soknad = req.body;

  const { formatMessage } = getIntl();
  const søknadPdf = mapSøknadToPdf(søknad, new Date(), formatMessage, []);
  try {
    const soknadRes = await sendSoknad({ kvittering: søknadPdf, filer: [] }, accessToken);
    metrics.sendSoknadCounter.inc({ type: 'STANDARD' });
    res.status(201).json({});
  } catch (err) {
    throw err;
  }
});

export const sendSoknad = async (innsending: SoknadInnsendingRequestBody, accessToken?: string) => {
  if (isLabs()) {
    return { uri: `https://localhost:3000/aap/soknad/api/vedlegg/les?uuid=${randomUUID()}` };
  }
  if (isMock()) {
    await slettBucket('STANDARD', accessToken);
    return { uri: `https://localhost:3000/aap/soknad/api/vedlegg/les?uuid=${randomUUID()}` };
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