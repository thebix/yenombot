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