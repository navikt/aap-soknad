const express = require('express');
const server = express();
const path = require('path');

const BASE_PATH = '/aap';
const HOME_FOLDER = './build';
const PORT = process.env.PORT || 3000;

const startServer = () => {
    server.use(BASE_PATH, express.static(HOME_FOLDER));

    // health checks
    server.get(`${BASE_PATH}/internal/isAlive`, (req, res) => res.sendStatus(200));
    server.get(`${BASE_PATH}/internal/isReady`, (req, res) => res.sendStatus(200));

    server.get('/*', (req, res) => {
        res.sendFile(path.join(__dirname, HOME_FOLDER, 'index.html'));
    });

    server.use(function (req, res) {
        // eslint-disable-next-line no-console
        console.error('Server: Error 404', req.url);
        res.status(404).send('404 not found');
    });

    server.use(function (err, req, res) {
        // eslint-disable-next-line no-console
        console.error('Server: Error 500', err);
        res.status(500).send('500 Error');
    });

    server.listen(PORT, () => {
        // eslint-disable-next-line no-console
        console.log('Server: listening on port', PORT);
    });
};

startServer();
