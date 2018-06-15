import { Check } from './check';
import { expectify } from './expectify';

declare const process: any;
declare const require: any;

const colorify = (() => {
    const param = 'param';
    const isBrowser = typeof process !== 'undefined' && process.browser;
    const mocha = isBrowser ? null : require('mocha');
    const base = mocha && mocha.reporters && mocha.reporters.Base;

    if (base) {
        base.colors[param] = 35;
    }

    return (str: string) => base ? base.color(param, str) : str;
})();

export const parametrify = (getArgs: () => Array<any>, original: (expectation: string, assertion?: (done?: MochaDone) => void) => any) => {
    Check.isFunction(getArgs);
    Check.isFunction(original);
    return (expectation: string, assertion?: () => void): any => {
        const run = (args: Array<any>): any => {
            const message = expectation + ' ' + colorify(expectify(args));
            if (typeof assertion !== 'function') {
                return original(message, assertion);
            } else if (assertion.length > args.length) {
                return original(message, function(doneFn) { return assertion.apply(this, args.concat([doneFn])); });
            } else {
                return original(message, function() { return assertion.apply(this, args); });
            }
        };
        const runnables = Check.isArray(getArgs()).map(run);
        const first = runnables[0];
        if (first === undefined) {
            return;
        }
        const result = new first.constructor(expectation, assertion);
        for (const p of ['timeout', 'retries', 'slow']) {
            if (p in first) {
                result[p] = (n: any) => {
                    runnables.forEach(r => r[p](n));
                    return result;
                };
            }
        }
        if ('async' in first) {
            result.async = assertion && (assertion.length - 1);
            result.sync = !result.async;
        }
        for (const p of ['parent', 'file', 'ctx']) {
            if (p in first) {
                result[p] = first[p];
            }
        }
        return result;
    };
};
