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
    isAskingForBalanceChange(text) {
        const pattern = /[-+]?[0-9]*\.?[0-9]*/i
        return text.match(pattern)
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