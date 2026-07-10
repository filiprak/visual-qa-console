import 'dotenv/config';
import fs from 'fs';
import https from 'https';
import { createServer } from './app.js';

const isDev = process.argv[2] === 'development';
const port = parseInt(process.env.PORT || '8080');
const host = process.env.HOST || 'localhost';
const ssl = parseInt(process.env.SSL || '0');
const sslCertPath = process.env.SSL_CERT || '';
const sslKeyPath = process.env.SSL_KEY || '';

const app = await createServer({ isDev });

const onListen = () => {
    console.log(`Server running at http${ssl ? 's' : ''}://${host}:${port} [${!isDev ? 'PROD' : 'DEV'}]`);
};

function getSSLKeys() {
    try {
        const cert = fs.readFileSync(sslCertPath, 'utf-8');
        const key = fs.readFileSync(sslKeyPath, 'utf-8');

        return { cert, key };
    } catch (e) {
        throw new Error('Failed to get SSL Keys.');
    }
}

if (ssl) {
    https
        .createServer({ ...getSSLKeys() }, app.callback())
        .listen(port, host, onListen);
} else {
    app.listen(port, host, onListen);
}
