import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import config from './config';

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

  // Render app
  server.get(`${config.BASE_PATH}/*`, (req: any, res: any) =>
    res.sendFile(path.join(BUILD_PATH, 'index.html'))
  );

  server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log("Server: listening on port", PORT);
  });
};

startServer();
