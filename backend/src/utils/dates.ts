import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';

dayjs.extend(utc);

export const utcNow = () => dayjs.utc().format('YYYY-MM-DD HH:mm:ss');

export { dayjs };
