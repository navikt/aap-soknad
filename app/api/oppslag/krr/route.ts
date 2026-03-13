import { NextRequest, NextResponse } from 'next/server';
import { beskyttetApi } from 'auth/beskyttetApi';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { logError, tokenXApiProxy } from '@navikt/aap-felles-utils';
import { isMock } from 'utils/environments';
import metrics from 'utils/metrics';
import { mockKrr } from 'mock/krr';
import { z } from 'zod';

const KrrInfo = z.object({
  epost: z.string().nullable(),
  mobil: z.string().nullable(),
});
export type KrrKontaktInfo = z.infer<typeof KrrInfo>;

export const getKrr = async (accessToken?: string | null): Promise<KrrKontaktInfo | null> => {
  const krr = isMock()
    ? mockKrr()
    : await tokenXApiProxy({
        url: `${process.env.OPPSLAG_URL}/krr`,
        prometheusPath: 'oppslag/krr',
        method: 'GET',
        audience: process.env.OPPSLAG_AUDIENCE!,
        bearerToken: accessToken ?? undefined,
        metricsStatusCodeCounter: metrics.backendApiStatusCodeCounter,
        metricsTimer: metrics.backendApiDurationHistogram,
      });
  const validatedResponse = KrrInfo.safeParse(krr);
  if (!validatedResponse.success) {
    logError(`oppslag/krr valideringsfeil: ${validatedResponse.error.message}`);
    return null;
  }
  return validatedResponse.data;
};

export const GET = beskyttetApi(async (req: NextRequest) => {
  const accessToken = getAccessTokenFromRequest(req);
  return NextResponse.json(await getKrr(accessToken), { status: 200 });
});
