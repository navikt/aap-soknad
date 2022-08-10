import { NextApiRequest, NextApiResponse } from 'next/dist/shared/lib/utils';
import axios from 'axios';

import { getTokenxToken } from './getTokenxToken';
import logger from '../utils/logger';

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
  /*if (opts.req.method !== opts.method) {
    throw new ErrorMedStatus(`Støtter ikke metode ${opts.req.method}`, 404);
  }*/

  try {
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
      logger.error(
        await response.json(),
        `tokenXProxy: status for ${opts.url} er ${response.status}`
      );
      return response;
    }
    if (opts.noResponse) {
      return;
    }
    if (opts.rawResonse) {
      return response;
    }
    return await response.json();
  } catch (e) {
    logger.error(e, 'tokenXProxy');
  }
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

  try {
    const { data } = await axios.post(opts.url, opts.req, {
      responseType: 'stream',
      headers: {
        'Content-Type': opts.req?.headers['content-type'] ?? '', // which is multipart/form-data with boundary included
        Authorization: `Bearer ${tokenxToken}`,
      },
    });
    return data.pipe(opts.res);
  } catch (e: any) {
    let msg = '';
    await new Promise((resolve) => {
      e.response.data
        .on('data', (chunk: string) => {
          msg += chunk;
        })
        .on('end', () => {
          resolve(msg);
        });
    });
    logger.error({ msg }, 'tokenXAxiosProxy');
  }
};
