import { l } from '../logger'
import _config from '../config'

export default class InputParser {
    isDeveloper(id) {
        return _config.developers
            && _config.developers.length > 0
            && _config.developers.some(x => x == id)
    }
    isAskingForEcho(text) {
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
    isAskingForBalanceChange(text) {
        const pattern = /[-+]?[0-9]*\.?[0-9]*/i //TODO: улучшить регекс определения арифметического выражения
        const res = text.match(pattern)
        return res && res.length > 0 && parseInt(res[0]) > 0
    }
    // isAskingForGenreList(text) {
    //     const pattern = /music|recommendation/i

    //     return text.match(pattern)
    // }

    // isAskingForNumberOfRec(text, prevCommand) {
    //     return prevCommand === commands.GET_GENRE_LIST
    // }

    // isAskingForRecommendation(text, prevCommand) {
    //     return prevCommand === commands.SET_NUMBER_OF_REC
    // }
}