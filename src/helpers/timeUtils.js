import ms from 'ms';
import humanizeDuration from 'humanize-duration';
import prettyMs from 'pretty-ms';
import dayjs from 'dayjs';
import moment from 'moment';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import duration from 'dayjs/plugin/duration.js';

dayjs.extend(relativeTime);
dayjs.extend(duration);

export class TimeUtils {
    static parseTime(input) {
        if (typeof input === 'number') return input;
        return ms(input);
    }

    static formatDuration(milliseconds, options = {}) {
        return humanizeDuration(milliseconds, {
            round: true,
            largest: 2,
            language: 'en',
            ...options
        });
    }

    static prettyTime(milliseconds, options = {}) {
        return prettyMs(milliseconds, { 
            verbose: true,
            secondsDecimalDigits: 0,
            ...options 
        });
    }

    static formatTimestamp(date, format = 'YYYY-MM-DD HH:mm:ss') {
        return dayjs(date).format(format);
    }

    static momentFormat(date, format = 'MMMM Do YYYY, h:mm:ss a') {
        return moment(date).format(format);
    }

    static timeAgo(date) {
        return dayjs(date).fromNow();
    }

    static addTime(date, amount, unit) {
        return dayjs(date).add(amount, unit).toDate();
    }

    static subtractTime(date, amount, unit) {
        return dayjs(date).subtract(amount, unit).toDate();
    }

    static isExpired(expiryDate) {
        return dayjs().isAfter(dayjs(expiryDate));
    }

    static getUnixTimestamp(date = new Date()) {
        return Math.floor(date.getTime() / 1000);
    }

    static getDuration(start, end) {
        return dayjs(end).diff(dayjs(start));
    }

    static formatMuteTime(milliseconds) {
        const duration = dayjs.duration(milliseconds);
        const days = duration.days();
        const hours = duration.hours();
        const minutes = duration.minutes();
        
        if (days > 0) return `${days}d ${hours}h ${minutes}m`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    }

    static parseDurationString(str) {
        const regex = /(\d+)([smhdw])/g;
        let total = 0;
        let match;
        
        while ((match = regex.exec(str)) !== null) {
            const value = parseInt(match[1]);
            const unit = match[2];
            
            switch (unit) {
                case 's': total += value * 1000; break;
                case 'm': total += value * 60 * 1000; break;
                case 'h': total += value * 60 * 60 * 1000; break;
                case 'd': total += value * 24 * 60 * 60 * 1000; break;
                case 'w': total += value * 7 * 24 * 60 * 60 * 1000; break;
            }
        }
        
        return total;
    }
}