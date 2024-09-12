import { getToken, requestOboToken, validateToken } from '@navikt/oasis';
import { logError, logInfo, logWarning } from '@navikt/aap-felles-utils';
import { randomUUID } from 'crypto';
import { IncomingMessage } from 'http';
import { ErrorMedStatus } from 'lib/utils/api/ErrorMedStatus';

export const getOnBefalfOfToken = async (
  audience: string,
  url: string,
  req: IncomingMessage,
): Promise<string> => {
  const token = getToken(req);
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
  req?: IncomingMessage;
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
  const onBehalfOfToken = await getOnBefalfOfToken(audience, url, req);
  const navCallId = randomUUID();

  logInfo(`${req.method} ${url}, callId ${navCallId}`);

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

    const headers = response.headers.get('content-type');
    const isJson = headers?.includes('application/json');

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
