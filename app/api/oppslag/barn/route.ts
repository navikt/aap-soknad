import { NextRequest, NextResponse } from 'next/server';
import { beskyttetApi } from 'auth/beskyttetApi';
import { getAccessTokenFromRequest } from 'auth/accessToken';
import { logError, tokenXApiProxy } from '@navikt/aap-felles-utils';
import metrics from 'utils/metrics';
import { z } from 'zod';
import { mockBarn } from 'mock/barn';
import { isMock } from 'utils/environments';

const Barn = z.object({
  navn: z.string(),
  fødselsdato: z.string(),
});
export type Barn = z.infer<typeof Barn>;

export const getBarn = async (accessToken?: string | null): Promise<Array<Barn>> => {
  const barn = isMock()
    ? mockBarn()
    : await tokenXApiProxy({
        url: `${process.env.OPPSLAG_URL}/person/barn`,
        prometheusPath: 'oppslag/barn',
        method: 'GET',
        audience: process.env.OPPSLAG_AUDIENCE!,
        bearerToken: accessToken ?? undefined,
        metricsStatusCodeCounter: metrics.backendApiStatusCodeCounter,
        metricsTimer: metrics.backendApiDurationHistogram,
      });

  const validatedResponse = z.array(Barn).safeParse(barn);
  if (!validatedResponse.success) {
    logError(`oppslag/barn valideringsfeil: ${validatedResponse.error.message}`);
    return [];
  }
  return validatedResponse.data;
};

export const GET = beskyttetApi(async (req: NextRequest) => {
  const accessToken = getAccessTokenFromRequest(req);
  return NextResponse.json(await getBarn(accessToken), { status: 200 });
});
