import _config from '../config'
import _commands from '../enums/commands'

export default class InputParser {
    isDeveloper(id) {
        return _config.developers
            && _config.developers.length > 0
            && _config.developers.some(x => x === id)
    }
    isAskingForEcho() {
        return true
    }
    isAskingForHelp(text) {
        const pattern = /help|помощь/i
        return text.match(pattern)
    }
    isAskingForStart(text) {
        const pattern = /start/i
        return text.match(pattern)
    }
    isAskingForInitToken(text) {
        const pattern = /token/i
        return text.match(pattern)
    }
    isAskingForBalance(text) {
        const pattern = /^\/bal$|^\/balance$/i
        return text.match(pattern)
    }
    isAskingForBalanceInit(text) {
        const pattern = /^\/bal init$|^\/balance init$/i
        return text.match(pattern)
    }
    isAskingForBalanceChange(text) {
        // before lint: const pattern = /^([0-9\-\*\+\/\s\(\)\.,]+)$/
        const pattern = /^([0-9\-*+/\s().,]+)$/
        const res = text.match(pattern)
        return !!res && res.length > 0 && res.some(x => !!x)
    }
    isAskingForCategoryChange(text, prevCommand, data) {
        return data
            && data.cmd === _commands.BALANCE_CATEGORY_CHANGE
    }
    isAskingForCommentChange(text, prevCommand) {
        const res = prevCommand
            && (prevCommand === _commands.BALANCE_CHANGE
                || prevCommand === _commands.BALANCE_CATEGORY_CHANGE)

        return res
    }
    isAskingForBalanceDelete(text, prevCommand, data) {
        return data.cmd === _commands.BALANCE_REMOVE
    }
    isAskingForReport(text) {
        const pattern = /^\/repo|report/i
        return text.match(pattern)
    }
    isAskingForStats(text) {
        const pattern = /^\/stat|stats/i
        return text.match(pattern)
    }
}
