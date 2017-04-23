export default class InputParser {
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