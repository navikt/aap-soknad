import { NextApiRequest } from 'next/dist/shared/lib/utils';

import { getTokenxToken } from './getTokenxToken';

class ErrorMedStatus extends Error {
  private status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

interface Opts {
  url: string;
  //req: NextApiRequest;
  audience: string;
  method: 'GET' | 'POST' | 'DELETE';
  data?: string;
  noResponse?: boolean;
  bearerToken?: string;
}

export const tokenXProxy = async (opts: Opts) => {
  /*if (opts.req.method !== opts.method) {
    throw new ErrorMedStatus(`Støtter ikke metode ${opts.req.method}`, 404);
  }*/

  const idportenToken = opts.bearerToken!.split(' ')[1];
  const tokenxToken = await getTokenxToken(idportenToken, opts.audience);
  const response = await fetch(opts.url, {
    method: opts.method,
    body: opts.data,
    headers: { Authorization: `Bearer ${tokenxToken}` },
  });

  if (response.status > 200 || response.status < 300) {
    console.log(
      `Status for ${opts.url} er ${response.status}. Response json er: ${response.json()}`
    );
    throw new ErrorMedStatus(`Ikke 2XX svar fra ${opts.url}`, 500);
  }
  if (opts.noResponse) {
    return;
  }
  return response.json();
};
