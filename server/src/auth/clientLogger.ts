import { Request, Response } from 'express';
import { LogError } from '../logger';

export const logClientError = (req: Request, res: Response) => {
  LogError(req?.body?.error, {
    type: 'client error',
    error: req?.body?.error,
    stack: req?.body?.stack,
  });
  res.sendStatus(200);
};
