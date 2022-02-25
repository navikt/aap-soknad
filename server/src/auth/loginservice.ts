import { Request, Response } from 'express';
import config from '../config';

export const redirectToLoginservice = function (req: Request, res: Response) {
  // Save url in cookie so we can route to same path after loginservice
  res.cookie('APP_PATH', req.originalUrl, {
    httpOnly: true,
    domain: 'nav.no',
  });
  res.redirect(
    `${process.env.LOGINSERVICE_URL}?redirect=${config.APP_URL}${config.BASE_PATH}/loginservice`
  );
};

export const loginserviceCallback = (req: Request, res: Response) => {
  const path = `${req.cookies['APP_PATH'] || ''}`;
  res.cookie('APP_PATH', ' ', { httpOnly: true, domain: 'nav.no' });
  res.redirect(path);
};
