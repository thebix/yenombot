import _token from './token'

const isProduction = process.env.NODE_ENV === 'production'

export default {
    isProduction: isProduction,
    log: isProduction ? "INFO" : "DEBUG",
    developers: _token.developers
}