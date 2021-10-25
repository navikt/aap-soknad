import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import config from './config';
import { enforceIDPortenAuthenticationMiddleware } from './auth';
import { getHtmlWithDecorator } from "./dekorator";
import { tokenXProxy} from "./apiProxy";
import {getToken} from "./auth/tokenx";
import fetch from "node-fetch";

const BUILD_PATH = path.join(__dirname, "../build");
const PORT = process.env.PORT || 3000;
const server = express();

const startServer = () => {
  server.use(cookieParser());
  server.use(express.static(BUILD_PATH));

  // health checks
  server.get([`${config.BASE_PATH}/internal/isAlive`, `${config.BASE_PATH}/internal/isReady`], (req: any, res: any) =>
    res.sendStatus(200)
  );

  // Callback from loginservice, get originalUrl from cookie
  server.use(`${config.BASE_PATH}/loginservice`, loginserviceCallback);

  // Enforce authentication
  server.use(`${config.BASE_PATH}/*`, enforceIDPortenAuthenticationMiddleware);

  server.get([`${config.BASE_PATH}/apitest`, `${config.BASE_PATH}/internal/isReady`], async (req: any, res: any) => {
    const {authorization} = req.headers;
    const token = authorization.split(" ")[1];
    const headers = await getToken(token, config.SOKNAD_API_AUDIENCE).then(
      apiToken => ({
        'Authorization': `Bearer ${apiToken}`
      }),
      error => {
        console.log('Error ved token ex', error)
        return {};
      });
    const apiRes = await fetch(`${config.SOKNAD_API_URL}/api/me`, {headers});
    console.log(apiRes.status, apiRes.statusText, apiRes.ok);
    const data = await apiRes.json();
    console.log('api response: ', data)
    if (data) res.json(data);
  });

  // Reverse proxy to add tokenx header for api calls
  tokenXProxy(`${config.BASE_PATH}/api`, server);

  // Render app
  server.get(`${config.BASE_PATH}/*`, (req: any, res: any) =>
    getHtmlWithDecorator(`${BUILD_PATH}/index.html`)
      .then((html) => {
        res.send(html);
      })
      .catch((e) => {
        res.status(500).send(e);
      })
  );

  server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log("Server: listening on port", PORT);
  });
};

const loginserviceCallback = async (req: any, res: any) => {
  const path = `${req.cookies["APP_PATH"] || ""}`;
  res.cookie("APP_PATH", "", { httpOnly: true, domain: "nav.no" });
  res.redirect(path);
};

startServer();
