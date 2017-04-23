const isProduction = process.env.NODE_ENV === 'production'

export default {
    isProduction: isProduction,
    log: isProduction ? "INFO" : "DEBUG"
}