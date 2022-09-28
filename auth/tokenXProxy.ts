import { NextApiRequest, NextApiResponse } from 'next/dist/shared/lib/utils';
import axios from 'axios';

import { getTokenxToken } from './getTokenxToken';
import logger from '../utils/logger';
import { ErrorMedStatus } from './ErrorMedStatus';

interface Opts {
  url: string;
  audience: string;
  method: 'GET' | 'POST' | 'DELETE';
  data?: string;
  req?: NextApiRequest;
  contentType?: string;
  rawResonse?: boolean;
  noResponse?: boolean;
  bearerToken?: string;
}

export const tokenXProxy = async (opts: Opts) => {
  logger.info('starter request mot ' + opts.url);

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
    const isJson = response.headers.get('content-type')?.includes('application/json');
    const data = isJson ? await response.json() : null;
    logger.error({
      msg: `tokenXProxy: status for ${opts.url} er ${response.status}: ${response.statusText}.`,
      navCallId: data?.['Nav-CallId'],
    });
    console.log('reponse', response);
    console.log('data', data);
    throw new ErrorMedStatus(
      `tokenXProxy: status for ${opts.url} er ${response.status}.`,
      response.status,
      data?.['Nav-CallId'] || ''
    );
  }
  logger.info(`Vellyket tokenXProxy-request mot ${opts.url}. Status: ${response.status}`);
  if (opts.noResponse) {
    return;
  }
  if (opts.rawResonse) {
    return response;
  }
  return await response.json();
};

interface AxiosOpts {
  url: string;
  audience: string;
  req: NextApiRequest;
  res: NextApiResponse;
  bearerToken?: string;
}

export const tokenXAxiosProxy = async (opts: AxiosOpts) => {
  const idportenToken = opts.bearerToken!.split(' ')[1];
  const tokenxToken = await getTokenxToken(idportenToken, opts.audience);

  logger.info('Starter opplasting av fil til ' + opts.url);
  logger.info('content-type fra klient' + opts.req?.headers['content-type']);
  try {
    const { data } = await axios.post(opts.url, opts.req, {
      responseType: 'stream',
      headers: {
        'Content-Type': opts.req?.headers['content-type'] ?? '', // which is multipart/form-data with boundary included
        Authorization: `Bearer ${tokenxToken}`,
      },
    });
    logger.info('Vellykket opplasting av fil til ' + opts.url);
    return data.pipe(opts.res);
  } catch (e: any) {
    if (e.response.status === 422) {
      return opts.res.status(422).json(e.response.data);
    }
    let msg = '';
    logger.error({ e }, 'tokenXAxiosProxy oops ' + e.message);
    return opts.res.status(500).json({ msg });
  }
};
