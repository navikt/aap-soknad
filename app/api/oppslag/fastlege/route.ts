import { NextRequest, NextResponse } from 'next/server';
import { beskyttetApi } from 'auth/beskyttetApi';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { logError, tokenXApiProxy } from '@navikt/aap-felles-utils';
import metrics from 'utils/metrics';
import { z } from 'zod';
import { isDev, isMock } from 'utils/environments';
import { mockFastlege } from 'mock/fastlege';

const Fastlege = z.object({
  navn: z.string(),
  behandlerRef: z.string(),
  kontaktinformasjon: z.object({
    kontor: z.string().nullish(),
    adresse: z.string().nullish(),
    telefon: z.string().nullish(),
  }),
});
export type Fastlege = z.infer<typeof Fastlege>;

export const getFastlege = async (accessToken?: string | null): Promise<Fastlege[]> => {
  if (isMock() || isDev()) return mockFastlege;

  const fastlege = await tokenXApiProxy({
    url: `${process.env.OPPSLAG_URL}/fastlege`,
    prometheusPath: 'oppslag/fastlege',
    method: 'GET',
    audience: process.env.OPPSLAG_AUDIENCE!,
    bearerToken: accessToken ?? undefined,
    metricsStatusCodeCounter: metrics.backendApiStatusCodeCounter,
    metricsTimer: metrics.backendApiDurationHistogram,
  });

  const validatedResponse = z.array(Fastlege).safeParse(fastlege);
  if (!validatedResponse.success) {
    logError(`oppslag/fastlege valideringsfeil: ${validatedResponse.error.message}`);
    return [];
  }
  return validatedResponse.data;
};

export const GET = beskyttetApi(async (req: NextRequest) => {
  const accessToken = getAccessTokenFromRequest(req);
  return NextResponse.json(await getFastlege(accessToken), { status: 200 });
});
