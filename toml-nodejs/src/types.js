"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalDateTime = exports.LocalTime = exports.LocalDate = void 0;
const errors_js_1 = require("./errors.js");
const isYear = (value) => {
    return 0 <= value && value <= 9999;
};
const isMonth = (value) => {
    return 0 < value && value <= 12;
};
const isDay = (value) => {
    return 0 < value && value <= 31;
};
class LocalDate {
    year;
    month;
    day;
    constructor(year, month, day) {
        this.year = year;
        this.month = month;
        this.day = day;
    }
    static fromString(value) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            throw new errors_js_1.TOMLError(`invalid local date format "${value}"`);
        }
        const [year, month, day] = value.split('-').map((component) => parseInt(component, 10));
        if (!isYear(year) || !isMonth(month) || !isDay(day)) {
            throw new errors_js_1.TOMLError(`invalid local date format "${value}"`);
        }
        return new LocalDate(year, month, day);
    }
}
exports.LocalDate = LocalDate;
const isHour = (value) => {
    return 0 <= value && value < 24;
};
const isMinute = (value) => {
    return 0 <= value && value < 60;
};
const isSecond = (value) => {
    return 0 <= value && value < 60;
};
class LocalTime {
    hour;
    minute;
    second;
    millisecond;
    constructor(hour, minute, second, millisecond) {
        this.hour = hour;
        this.minute = minute;
        this.second = second;
        this.millisecond = millisecond;
        this.millisecond = parseInt(millisecond.toString(10).slice(0, 3), 10);
    }
    static fromString(value) {
        if (!/^\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(value)) {
            throw new errors_js_1.TOMLError(`invalid local time format "${value}"`);
        }
        const components = value.split(':');
        const [hour, minute] = components.slice(0, 2).map((component) => parseInt(component, 10));
        const [second, millisecond] = components[2].split('.').map((component) => parseInt(component, 10));
        if (!isHour(hour) || !isMinute(minute) || !isSecond(second)) {
            throw new errors_js_1.TOMLError(`invalid local time format "${value}"`);
        }
        return new LocalTime(hour, minute, second, isNaN(millisecond) ? 0 : millisecond);
    }
}
exports.LocalTime = LocalTime;
class LocalDateTime {
    year;
    month;
    day;
    hour;
    minute;
    second;
    millisecond;
    constructor(year, month, day, hour, minute, second, millisecond) {
        this.year = year;
        this.month = month;
        this.day = day;
        this.hour = hour;
        this.minute = minute;
        this.second = second;
        this.millisecond = millisecond;
    }
    static fromString(value) {
        const components = value.split(/[tT ]/);
        if (components.length !== 2) {
            throw new errors_js_1.TOMLError(`invalid local date-time format "${value}"`);
        }
        const date = LocalDate.fromString(components[0]);
        const time = LocalTime.fromString(components[1]);
        return new LocalDateTime(date.year, date.month, date.day, time.hour, time.minute, time.second, time.millisecond);
    }
}
exports.LocalDateTime = LocalDateTime;
