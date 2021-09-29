const express = require("express");
const server = express();
const path = require("path");

const BASE_PATH = "/aap";
const BUILD_PATH = path.join(__dirname, "../build");
const PORT = process.env.PORT || 3000;

const startServer = () => {
  server.use(express.static(BUILD_PATH));

  // health checks
  server.get(`${BASE_PATH}/internal/isAlive`, (req, res) =>
    res.sendStatus(200)
  );
  server.get(`${BASE_PATH}/internal/isReady`, (req, res) =>
    res.sendStatus(200)
  );

  server.use(`${BASE_PATH}/*`, (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
      res.redirect(`/oauth2/login?redirect=${BASE_PATH}`);
    } else {
      next();
    }
  });

  server.get(`${BASE_PATH}/*`, (req, res) => {
    res.sendFile(path.join(BUILD_PATH, "index.html"));
  });

  server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log("Server: listening on port", PORT);
  });
};

startServer();
