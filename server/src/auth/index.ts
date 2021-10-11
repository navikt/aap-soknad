import { Request, Response, NextFunction} from "express";
import config from '../config';
import {validerToken} from "./idporten";

export const enforceIDPortenAuthenticationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const loginPath = `/oauth2/login?redirect=${req.originalUrl}/`;
  const { authorization } = req.headers;
  const selvbetjeningIdtoken = req.cookies["selvbetjening-idtoken"];

  // Not logged in - log in with wonderwall
  if (!authorization) {
    res.redirect(loginPath);
    // Log in with loginservice (for decorator)
  } else if (!selvbetjeningIdtoken) {
    // Save url in cookie so we can route to same path after loginservice
    res.cookie("APP_PATH", req.originalUrl, {
      httpOnly: true,
      domain: "nav.no",
    });
    res.redirect(
      `${process.env.LOGINSERVICE_URL}?redirect=${config.APP_URL}${config.BASE_PATH}/loginservice`
    );

  } else {
    // Validate token and continue to app
    const token = authorization.split(" ")[1];
    const JWTVerifyResult = await validerToken(token);
    if (!JWTVerifyResult?.payload) {
      res.redirect(loginPath);
    } else {
      next();
    }
  }
};

