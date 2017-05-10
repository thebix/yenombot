//INFO: в дальнейшем можно добавить конструктор (с часовым поясом, например) 

export default class Time {
    getChangedDateTime(
        options = {
            days: null,
            hours: null,
            minutes: null,
            seconds: null,
            ticks: null
        },
        date = new Date()
    ) {
        let dt = new Date(date)
        if (options.days != null)
            dt.setDate(dt.getDate() + options.days)
        if (options.hours != null)
            dt.setHours(dt.getHours() + options.hours)
        if (options.minutes != null)
            dt.setMinutes(dt.getMinutes() + options.minutes)
        if (options.seconds != null)
            dt.setSeconds(dt.getSeconds() + options.seconds)
        if (options.ticks != null) {
            dt.setTime(dt.getTime() + options.ticks)
        } 
        return dt
    }

    getDateString(date = new Date()) {
        const options = {
            year: '2-digit', month: 'numeric', day: 'numeric',
            hour: '2-digit', minute: '2-digit', second: 'numeric',
            hour12: false,
            weekday: "long"
        }
        return `${date.toLocaleDateString()} ${("0" + date.getHours()).slice(-2)}:${("0" + date.getMinutes()).slice(-2)}:${("0" + date.getSeconds()).slice(-2)}`
    }
}