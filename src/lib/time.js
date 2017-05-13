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

    dateTimeString(date = new Date()) {
        const options = {
            year: '2-digit', month: 'numeric', day: 'numeric',
            hour: '2-digit', minute: '2-digit', second: 'numeric',
            hour12: false,
            weekday: "long"
        }
        return `${this.dateString(date)} ${("0" + date.getHours()).slice(-2)}:${("0" + date.getMinutes()).slice(-2)}:${("0" + date.getSeconds()).slice(-2)}`
    }

    dateString(date = new Date(), isFullYear = false) {
        
        const options = {
            year: '2-digit', month: 'numeric', day: 'numeric',
            hour: '2-digit', minute: '2-digit', second: 'numeric',
            hour12: false,
            weekday: "long"
        }
        return `${("0" + date.getDate()).slice(-2)}.${("0" + (date.getMonth() + 1)).slice(-2)}.${date.getFullYear() - (isFullYear ? 0 : 2000 )}`
        // return date.toLocaleDateString()
    }

    dateWeekdayString( date = new Date()) {
        return `${this.weekday(date)} ${this.dateString(date)}`
    }

    weekday(date = new Date()) {
        switch(date.getDay()){
            case 1: return 'Пн'
            case 2: return 'Вт'
            case 3: return 'Ср'
            case 4: return 'Чт'
            case 5: return 'Пт'
            case 6: return 'Сб'
            case 7: return 'Вс'
        }
    }

    daysBetween(d1, d2) {
        return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24))
    }
}