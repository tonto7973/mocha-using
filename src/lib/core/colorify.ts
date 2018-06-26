
export const colorify = (() => {
    const param = 'param';
    const isBrowser = typeof process !== 'undefined' && (process as any).browser;
    const chalk = isBrowser ? null : require('chalk');

    return (str: string): string => chalk ? chalk.magenta(str) : str;
})();
