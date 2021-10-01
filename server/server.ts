const { getHtmlWithDecorator } = require("./dekorator");
const express = require("express");
const server = express();
const path = require("path");
const { validerToken } = require("./auth/idporten");

const BASE_PATH = "/aap";
const BUILD_PATH = path.join(__dirname, "../build");
const PORT = process.env.PORT || 3000;

const startServer = () => {
  server.use(express.static(BUILD_PATH));

  // health checks
  server.get(`${BASE_PATH}/internal/isAlive`, (req: any, res: any) =>
    res.sendStatus(200)
  );
  server.get(`${BASE_PATH}/internal/isReady`, (req: any, res: any) =>
    res.sendStatus(200)
  );

  server.use(`${BASE_PATH}/*`, async (req: any, res: any, next: any) => {
    const { authorization } = req.headers;

    if (!authorization) {
      res.redirect(`/oauth2/login?redirect=${BASE_PATH}/`);
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
