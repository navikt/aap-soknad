import { Application, Request} from "express";
import proxy from 'express-http-proxy';
import {getToken} from "./auth/tokenx";
import config from "./config";

const options = (targetAudience: string) => ({
  parseReqBody: true,
  proxyReqOptDecorator: (options: any, req: Request) => {
    console.log(`Veksler inn token til aud ${targetAudience}`);
    const { authorization } = req.headers;
    const token = authorization.split(" ")[1];
    return new Promise((resolve, reject) => {
      return getToken(token, targetAudience).then(
        apiToken => {
          options.headers.Authorization = `Bearer ${apiToken}`
          resolve(options)
        },
        error => {
          console.log('Error ved token ex', error)
          reject(error)
        })
    });
  },
  proxyReqPathResolver: (req: Request) => {
    console.log('Req orig url', req.originalUrl)
    if (req.originalUrl.startsWith('/aap')) {
      return req.originalUrl.slice(4);
    }
    return req.originalUrl;
  },
  // Mutate request body
  // proxyReqBodyDecorator: function(bodyContent, srcReq) {}
});



export const tokenXProxy = (path: string, server: Application) => {
  server.use(path, proxy(config.SOKNAD_API_URL, options(config.SOKNAD_API_AUDIENCE)));
}
