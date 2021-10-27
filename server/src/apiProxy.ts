import { Application, Request} from "express";
import proxy from 'express-http-proxy';
import {getToken} from "./auth/tokenx";
import config from "./config";

const options = (targetAudience: string) => ({
  parseReqBody: true,
  proxyReqOptDecorator: (options: any, req: Request) => {
    const { authorization } = req.headers;
    const token = authorization.split(" ")[1];
    return new Promise((resolve, reject) => {
      return getToken(token, targetAudience).then(
        apiToken => {
          resolve({
            ...options,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${apiToken}`
            }
          })
        },
        error => {
          console.log('Error ved token ex', error)
          reject(error)
        })
    });
  },
  proxyReqPathResolver: (req: Request) => {
    const newPath = (req.originalUrl.startsWith('/aap'))
      ? req.originalUrl.slice(4)
      : req.originalUrl;
    console.log('PROXY ', req.originalUrl, ' --> ', `${config.SOKNAD_API_URL}${newPath}`);
    return newPath;
  },
  // Mutate request body
  // proxyReqBodyDecorator: function(bodyContent, srcReq) {}
});



export const tokenXProxy = (path: string, server: Application) => {
  server.use(path, proxy(config.SOKNAD_API_URL, options(config.SOKNAD_API_AUDIENCE)));
}
