import { NextRequest, NextResponse } from 'next/server';
import { beskyttetApi } from 'auth/beskyttetApi';
import { logError } from '@navikt/aap-felles-utils';
import { z } from 'zod';
import { simpleTokenXProxy } from 'lib/utils/api/simpleTokenXProxy';
import { isMock } from 'utils/environments';
import { MockPerson } from 'mock/person';

const Person = z.object({
  navn: z.string(),
  fnr: z.string(),
  adresse: z.string().optional().nullable(),
  fødseldato: z.string().optional().nullable(),
});
export type Person = z.infer<typeof Person>;

export const getPerson = async (req?: Request | NextRequest | import('http').IncomingMessage) => {
  if (isMock()) {
    return MockPerson;
  }
  try {
    const person = await simpleTokenXProxy({
      url: `${process.env.OPPSLAG_URL}/person`,
      method: 'GET',
      audience: process.env.OPPSLAG_AUDIENCE!,
      req,
    });
    const validatedResponse = Person.safeParse(person);
    if (!validatedResponse.success) {
      logError(`oppslag/person valideringsfeil: ${validatedResponse.error.message}`);
      throw new Error('Error validating person from oppslag');
    }
    return validatedResponse.data;
  } catch (error) {
    logError('Noe gikk galt i henting av person fra oppslag', error);
    throw new Error('Error getting person from oppslag');
  }
};

export const GET = beskyttetApi(async (req: NextRequest) => {
  return NextResponse.json(await getPerson(req), { status: 200 });
});
