import { NextApiRequest } from 'next/dist/shared/lib/utils';
import axios from 'axios';

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
  req?: NextApiRequest;
  contentType?: string;
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
    headers: {
      Authorization: `Bearer ${tokenxToken}`,
      'Content-Type': opts.contentType ?? 'application/json',
    },
  });

  if (response.status < 200 || response.status > 300) {
    console.log(
      `Status for ${opts.url} er ${response.status}. Response json er: ${response.json()}`
    );
    throw new ErrorMedStatus(`Ikke 2XX svar fra ${opts.url}`, 500);
  }
  if (opts.noResponse) {
    return;
  }
  return await response.json();
};

export const tokenXAxiosProxy = async (opts: Opts) => {
  const idportenToken = opts.bearerToken!.split(' ')[1];
  const tokenxToken = await getTokenxToken(idportenToken, opts.audience);

  const { data } = await axios.post(opts.url, opts.req, {
    responseType: 'stream',
    headers: {
      'Content-Type': opts.req?.headers['content-type'] ?? '', // which is multipart/form-data with boundary included
      Authorization: `Bearer ${tokenxToken}`,
    },
  });
  return data.body;
};
