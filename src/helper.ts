/*
 * @Author: sumku404
 * @Date: 2022-08-19 20:34:18
 * @Description: 
 */
import CONFIG from './config.js';
import Logger from './Logger.js';

export const backSpaceFilter = (value : string) => {
    return value.replace(/\r\n|\r|\n|\\s/g, '');
};

export const getRandomSection = (start : number, end : number) => {
    return Math.floor(Math.random() * (end - start + 1) + start)
}

export const consoleColored = (type : 'warning' | 'error' | 'notice', message : string) => {
    const colors = {
        error       : '\x1B[31m',
        notice      : '\x1B[32m',
        warning     : '\x1B[33m',
        ending      : '\x1B[0m'
    }

    console.log(`${colors[type]}[${type}]:${colors.ending} ${message}`);
}
