import { createServer } from './app.js';

const isDev = process.argv[2] === 'development';
const port = parseInt(process.env.PORT || '8080');
const host = process.env.HOST || 'localhost';

const app = await createServer({ isDev });

app.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port} [${!isDev ? 'PROD' : 'DEV'}]`);
});
