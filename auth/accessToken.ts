import { IncomingMessage } from 'http';
import { NextRequest } from 'next/server';
import { headers } from 'next/headers';

/** Extract bearer token from a Node IncomingMessage or Web Request */
export const getAccessTokenFromRequest = (
  request: IncomingMessage | NextRequest | Request,
): string | undefined | null => {
  if (request == null) {
    throw new Error('Context is missing request. This should not happen');
  }

  if ('headers' in request) {
    const hdrs = request.headers;
    if (typeof (hdrs as any).get === 'function') {
      // Web Request / NextRequest
      return (hdrs as Headers).get('authorization');
    }
    // Node IncomingMessage — headers is a plain object
    return (hdrs as Record<string, string | string[] | undefined>)['authorization'] as
      | string
      | undefined;
  }

  return undefined;
};

/** Extract bearer token from Next.js App Router server-component headers() */
export const getAccessTokenFromServerHeaders = async (): Promise<string | null> => {
  const hdrs = await headers();
  return hdrs.get('authorization');
};
