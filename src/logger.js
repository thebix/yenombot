import _config from './config'

export const logLevel = {
    ERROR: 'ERROR',
    INFO: 'INFO ',
    DEBUG: 'DEBUG'
}

export const dateTimeString = (date = new Date()) => new Intl.DateTimeFormat('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Europe/Moscow'
}).format(date)

export const log = (text, level = logLevel.DEBUG) => {
    if (!text) return
    if (_config.log === logLevel.DEBUG
        || (_config.log === logLevel.INFO && (level === logLevel.INFO || level === logLevel.ERROR))
        || (_config.log === logLevel.ERROR && level === logLevel.ERROR)) {
        const t = `${dateTimeString()} | ${level} | ${text}`
        if (level === logLevel.ERROR) {
            console.error(t)
            console.trace(t)
        } else
            console.log(t)
    }
}

export const l = (text, obj = 'zero') => {
    let msg
    if (typeof (text) === 'object') {
        msg = JSON.stringify(text)
    }
    if (obj !== 'zero') {
        msg = `${text} = ${JSON.stringify(obj)}`
    }
    log(msg, logLevel.DEBUG)
}
