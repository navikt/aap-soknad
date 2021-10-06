import express from "express";
import path from "path";
import cookieParser from "cookie-parser";

import { getHtmlWithDecorator } from "./dekorator";
import { validerToken } from "./auth/idporten";

const BASE_PATH = "/aap";
const BUILD_PATH = path.join(__dirname, "../build");
const PORT = process.env.PORT || 3000;
const server = express();

const startServer = () => {
  server.use(cookieParser());
  server.use(express.static(BUILD_PATH));

  // health checks
  server.get(`${BASE_PATH}/internal/isAlive`, (req: any, res: any) =>
    res.sendStatus(200)
  );
  server.get(`${BASE_PATH}/internal/isReady`, (req: any, res: any) =>
    res.sendStatus(200)
  );
  server.use(`${BASE_PATH}/loginservice`, async (req: any, res: any) => {
    const path = `${BASE_PATH}${req.cookies["APP_PATH"]}`;
    res.cookie("APP_PATH", "", { httpOnly: true, domain: "nav.no" });
    res.redirect(path);
  });

  server.use(`${BASE_PATH}/*`, async (req: any, res: any, next: any) => {
    const { authorization } = req.headers;
    const selvbetjeningIdtoken = req.cookies["selvbetjening-idtoken"];

    // Not logged in - log in with wonderwall
    if (!authorization) {
      res.redirect(`/oauth2/login?redirect=${req.originalUrl}/`);
      // Log in with loginservice (for decorator)
    } else if (!selvbetjeningIdtoken) {
      res.cookie("APP_PATH", req.originalUrl, {
        httpOnly: true,
        domain: "nav.no",
      });
      res.redirect(
        `${process.env.LOGINSERVICE_URL}?redirect=${process.env.APP_URL}/loginservice`
      );
      // Validate token and continue to app
    } else {
      const token = authorization.split(" ")[1];
      await validerToken(token);
      next();
    }
  });

  server.get(`${BASE_PATH}/*`, (req: any, res: any) =>
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

startServer();
