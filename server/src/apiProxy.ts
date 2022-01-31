import { Application, Request } from "express";
import proxy from 'express-http-proxy';
import {getToken} from "./auth/tokenx";
import {LogError, LogInfo} from "./logger";
import config from "./config";
import {IncomingMessage} from "http";

const options = (targetAudience: string) => ({
  parseReqBody: true,
  proxyReqOptDecorator: (options: any, req: Request) => {
    const { authorization } = req.headers;
    const token = authorization.split(" ")[1];
    return new Promise((resolve, reject) => {
      return getToken(token, targetAudience).then(
        apiToken => {
          LogInfo(`TokenX: ${apiToken}`)
          resolve({
            ...options,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${apiToken}`
            }
          })
        },
        error => {
          LogError('TokenX error:', error)
          reject(error)
        })
    });
  },
  proxyReqPathResolver: (req: Request) => {
    const reqPath = req.originalUrl.startsWith('/aap/soknad-api')
      ? req.originalUrl.slice(15)
      : req.originalUrl;
    LogInfo(`proxy to: ${reqPath}`);
    return reqPath;
  },
  userResDecorator: function(proxyRes: IncomingMessage, proxyResData: any) {
    console.log('proxy response')
    console.log(proxyRes);
    return proxyResData;
  }
  // Mutate request body
  // proxyReqBodyDecorator: function(bodyContent, srcReq) {}
});



export const tokenXProxy = (path: string, server: Application) => {
  server.use(path, proxy(config.SOKNAD_API_URL, options(config.SOKNAD_API_AUDIENCE)));
}
