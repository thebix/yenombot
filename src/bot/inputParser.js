import token from '../token'
import commands from './commands'
import { USER_ID_UNUSED } from './message'

export default class InputParser {
    static isDeveloper(id) {
        return USER_ID_UNUSED === id
            || (token.developers
                && token.developers.length > 0
                && token.developers.some(x => x === id))
    }
    static isEcho() {
        return true
    }
    static isStart(text) {
        const pattern = /^\/start|старт/i
        return text.match(pattern)
    }
    static isHelp(text) {
        const pattern = /^\/help|помощь/i
        return text.match(pattern)
    }
    static isToken(text) {
        const pattern = /^\/token/i
        return text.match(pattern)
    }
    static isBalance(text) {
        const pattern = /^\/bal$|^\/balance$/i
        return text.match(pattern)
    }
    static isBalanceInit(text) {
        const pattern = /^\/bal init$|^\/balance init$/i
        return text.match(pattern)
    }
    static isBalanceChange(text) {
        const pattern = /^([0-9\-*+/\s().,]+)$/
        const res = text.match(pattern)
        return !!res && res.length > 0 && res.some(x => !!x)
    }
    static isCategoryChange(callbackCommand) {
        return callbackCommand === commands.BALANCE_CATEGORY_CHANGE
    }
    static isCommentChange(prevCommand) {
        return prevCommand === commands.BALANCE_CHANGE
            || prevCommand === commands.BALANCE_CATEGORY_CHANGE
    }
    static isBalanceDelete(callbackCommand) {
        return callbackCommand === commands.BALANCE_REMOVE
    }
    static isReport(text) {
        const pattern = /^\/repo|report/i
        return text.match(pattern)
    }
    static isStats(text) {
        const pattern = /^\/stat|stats/i
        return text.match(pattern)
    }
}
