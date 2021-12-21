import {NextFunction, Request, Response} from "express";
import {redirectToLoginservice} from "./loginservice";
import {validerToken} from "./idporten";
import {LogError} from "../logger";

export const enforceIDPortenAuthenticationMiddleware = async function(req: Request, res: Response, next: NextFunction) {
  const loginPath = `/oauth2/login?redirect=${req.originalUrl}/`;
  const {authorization} = req.headers;
  const selvbetjeningIdtoken = req.cookies["selvbetjening-idtoken"];

  // Not logged in - log in with wonderwall
  if (!authorization) {
    res.redirect(loginPath);
    // Log in with loginservice (for decorator)
  } else if (!selvbetjeningIdtoken) {
    redirectToLoginservice(req, res);
  } else {
    // Validate token and continue to app
    if(await validateAuthorization(authorization)) {
      next();
    } else {
      res.redirect(loginPath);
    }
  }
}


const validateAuthorization = async (authorization: string) => {
  try {
    const token = authorization.split(" ")[1];
    const JWTVerifyResult = await validerToken(token);
    // DEBUG
    console.log('fnr', JWTVerifyResult?.payload)
    return !!JWTVerifyResult?.payload;
  } catch (e) {
    LogError('idporten error', e);
    return false;
  }
}
