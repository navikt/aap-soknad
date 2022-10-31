import { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '@navikt/aap-felles-innbygger-utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  logger.info({ event: 'AAP_SOKNAD_SENDT' });
  res.status(200).json({});
}
