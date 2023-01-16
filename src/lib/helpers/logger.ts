
const debugLog = (function () {
    if (!console.log || process.env.NODE_ENV == 'production') {
        return function () { };
    }
    return Function.prototype.bind.call(console.log, console);
})();

const debugWarn = (function () {
    if (!console.warn || process.env.NODE_ENV == 'production') {
        return function () { };
    }
    return Function.prototype.bind.call(console.warn, console);
})();

const debugError = (function () {
    if (!console.error || process.env.NODE_ENV == 'production') {
        return function () { };
    }
    return Function.prototype.bind.call(console.error, console);
})();

export const debug = {
    log: debugLog,
    warn: debugWarn,
    error: debugError,
};
