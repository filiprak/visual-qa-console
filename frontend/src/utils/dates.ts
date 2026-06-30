import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(utc);
dayjs.extend(relativeTime);

export function fromNow(time_str: string) {
    return dayjs.utc(time_str).fromNow();
}

export function format(time_str: string, format = 'D MMM YYYY, HH:mm:ss') {
    return dayjs.utc(time_str).local().format(format);
}
