import { getToken, requestOboToken, validateToken } from '@navikt/oasis';
import { logError, logInfo, logWarning } from '@navikt/aap-felles-utils';
import { randomUUID } from 'crypto';
import { IncomingMessage } from 'http';
import { NextRequest } from 'next/server';
import { ErrorMedStatus } from 'lib/utils/api/ErrorMedStatus';

type SupportedRequest = IncomingMessage | NextRequest | Request;

export const getOnBehalfOfToken = async (
  audience: string,
  url: string,
  req: SupportedRequest,
): Promise<string> => {
  const token = getToken(req as Request | IncomingMessage);
  if (!token) {
    logError(`Token for ${url} er undefined`);
    throw new Error('Token for simpleTokenXProxy is undefined');
  }

  const validation = await validateToken(token);
  if (!validation.ok) {
    logError(`Token for ${url} validerte ikke`);
    throw new Error('Token for simpleTokenXProxy didnt validate');
  }

  const onBehalfOf = await requestOboToken(token, audience);
  if (!onBehalfOf.ok) {
    logError(`Henting av oboToken for ${url} feilet`, onBehalfOf.error);
    throw new Error('Request oboToken for simpleTokenXProxy failed');
  }

  return onBehalfOf.token;
};

interface Opts {
  url: string;
  method?: 'GET' | 'POST' | 'DELETE';
  audience: string;
  body?: object;
  req?: SupportedRequest;
}

export const simpleTokenXProxy = async <T>({
  url,
  audience,
  req,
  method = 'GET',
  body,
}: Opts): Promise<T> => {
  if (!req) {
    logError(`Request for ${url} er undefined`);
    throw new Error('Request for simpleTokenXProxy is undefined');
  }
  const onBehalfOfToken = await getOnBehalfOfToken(audience, url, req);
  const navCallId = randomUUID();

  const reqMethod = req instanceof Request || req instanceof NextRequest
    ? req.method
    : (req as IncomingMessage).method;
  logInfo(`${reqMethod} ${url}, callId ${navCallId}`);

  const response = await fetch(url, {
    method: method,
    headers: {
      Authorization: `Bearer ${onBehalfOfToken}`,
      'Content-Type': 'application/json',
      'Nav-CallId': navCallId,
    },
    body: method === 'POST' ? JSON.stringify(body) : undefined,
  });

  if (response.ok) {
    logInfo(`OK ${url}, status ${response.status}, callId ${navCallId}`);

    if (response.status === 204) {
      throw new ErrorMedStatus('No content', response.status, navCallId);
    }

    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (isJson) {
      try {
        return await response.json();
      } catch (e) {
        logWarning(`Kunne ikke parse json i simpleTokenXProxy for ${url}`);
      }
    }

    return (await response.text()) as T;
  }

  logError(
    `Error fetching simpleTokenXProxy. Fikk responskode ${response.status} fra ${url} med navCallId: ${navCallId}`,
  );
  throw new ErrorMedStatus('Error fetching simpleTokenXProxy', response.status, navCallId);
};
