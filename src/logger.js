import _config from './config.js'

export const logLevel = {
    ERROR: "ERROR",
    INFO: "INFO ",
    DEBUG: "DEBUG"
}

export const getDateString = (date = new Date()) => {
    const options = {
        year: '2-digit', month: 'numeric', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: 'numeric',
        hour12: false,
        weekday: "long"
    }
    return `${date.toLocaleDateString()} ${("0" + date.getHours()).slice(-2)}:${("0" + date.getMinutes()).slice(-2)}:${("0" + date.getSeconds()).slice(-2)}`
}

export const log = (text, level = logLevel.DEBUG) => {
    if (!text) return
    if (_config.log == logLevel.DEBUG
        || (_config.log == logLevel.INFO && (level == logLevel.INFO || level == logLevel.ERROR))
        || (_config.log == logLevel.ERROR && level == logLevel.ERROR)) {
        const t = `${getDateString()} | ${level} | ${text}`
        console.log(t)
    }
}

export const l = (text, obj = "zero") => {
    if(typeof(text) === 'object'){
        text = JSON.stringify(text)
    }
    if(obj !== "zero"){
        text = `${text} = ${JSON.stringify(obj)}`
    }
    log(text, logLevel.DEBUG)
}