import _config from './config'

export const logLevel = {
    ERROR: 'ERROR',
    INFO: 'INFO',
    DEBUG: 'DEBUG'
}

const dateTimeString = (date = new Date()) => `${date.toLocaleDateString()} ${`0${date.getHours()}`.slice(-2)}:${`0${date.getMinutes()}`.slice(-2)}:${`0${date.getSeconds()}`.slice(-2)}`

const log = (text, level = logLevel.DEBUG) => {
    if (!text) return
    if (_config.log === logLevel.DEBUG
        || (_config.log === logLevel.INFO && (level === logLevel.INFO || level === logLevel.ERROR))
        || (_config.log === logLevel.ERROR && level === logLevel.ERROR)) {
        const t = `${dateTimeString()} | ${level} | ${text}`
        console.log(t)
    }
}

export default class l {
    static ds(message, obj) {
        l.d(typeof (message) === 'object' ? JSON.stringify(message) : message,
            typeof (obj) === 'object' ? JSON.stringify(obj) : obj)
    }
    static d(message, obj) {
        if (_config.log !== logLevel.DEBUG)
            return

        let text = message
        if (Array.isArray(message)) {
            text = `${JSON.stringify(message)}`
        }

        if (Array.isArray(obj)) {
            text = `${text}: ${JSON.stringify(obj)}`
        } else if (typeof (obj) === 'string') {
            text = `${text}: ${obj}`
        }

        log(text, logLevel.DEBUG)
        if (typeof (message) === 'object') {
            console.log(message)
        }
        if (typeof (obj) === 'object') {
            console.log(obj)
        }
    }
    static e(err, obj) {
        let text = err
        if (Array.isArray(obj)) {
            text = `${err}: ${JSON.stringify(obj)}`
        } else if (typeof (obj) === 'string') {
            text = `${err}: ${obj}`
        } else if (typeof (obj) === 'object') {
            text = `${err}: ${JSON.stringify(obj)}`
        }
        log(text, logLevel.ERROR)
    }
}
