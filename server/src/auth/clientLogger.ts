import { Request, Response } from 'express';
import { LogError } from '../logger';

export const logClientError = (req: Request, res: Response) => {
  console.log(req?.body);
  LogError('clientLogger', { error: req?.body?.error, stack: req?.body?.stack });
  res.sendStatus(200);
};
