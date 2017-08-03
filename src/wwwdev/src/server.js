import { log, logLevel } from './logger'
import _config from './config'
import lib from './lib/root'

log(`Start server ${_config.isProduction ? '<Production>' : '<Debug>'}`, logLevel.INFO)

log(lib.time.dateTimeString())

lib.www.response.subscribe()
