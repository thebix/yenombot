import { l, log, logLevel } from '../logger'

//INFO: в дальнейшем можно добавить конструктор (с часовым поясом, например) 


const weekdays = {
    mo: 1,
    tu: 2,
    we: 3,
    th: 4,
    fr: 5,
    sa: 6,
    su: 0,
    unknown: 8
}

export default class Time {
    getChangedDateTime(
        options = {
            years: null,
            months: null,
            days: null,
            hours: null,
            minutes: null,
            seconds: null,
            ticks: null
        },
        date = new Date()
    ) {
        let dt = new Date(date)
        if (options.years != null)
            dt.setFullYear(dt.getFullYear() + options.years)
        if (options.months != null)
            dt.setMonth(dt.getMonth() + options.months)
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

    // 16.12.2017 | 16/12/2016 | 16/12 = 16/12/текущий год | 16 - текущий месяц
    getDate(date = new Date()) {
        if (Object.prototype.toString.call(date) === '[object Date]') return date
        date = date + ''
        let split = date.split('.')
        if (!split || split.length == 1)
            split = date.split('/')
        // if (!split || split.length == 0)
        //     return null
        const year = split.length == 3 ? split[2] : (new Date()).getFullYear()
        const month = split.length > 1 ? split[1] : (new Date()).getMonth() + 1
        const day = parseInt(split[0])
        if (isNaN(day))
            return null
        return new Date(year, month - 1, day)
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
        return `${("0" + date.getDate()).slice(-2)}.${("0" + (date.getMonth() + 1)).slice(-2)}.${date.getFullYear() - (isFullYear ? 0 : 2000)}`
    }



    getWeekday(day) {
        if (!day)
            return weekdays.unknown
        day = (day + '').toLowerCase()
        if (day == '1' || day == 'пн' || day == 'mo') return weekdays.mo
        if (day == '2' || day == 'вт' || day == 'tu') return weekdays.tu
        if (day == '3' || day == 'ср' || day == 'we') return weekdays.we
        if (day == '4' || day == 'чт' || day == 'th') return weekdays.th
        if (day == '5' || day == 'пт' || day == 'fr') return weekdays.fr
        if (day == '6' || day == 'сб' || day == 'sa') return weekdays.sa
        if (day == '7' || day == 'вс' || day == 'su') return weekdays.su
        return weekdays.unknown

    }

    dateWeekdayString(date = new Date()) {
        return `${this.weekdayString(date)} ${this.dateString(date)}`
    }

    weekdayString(date = new Date()) {
        switch (this.getWeekday(date.getDay())) {
            case weekdays.mo: return 'Пн'
            case weekdays.tu: return 'Вт'
            case weekdays.we: return 'Ср'
            case weekdays.th: return 'Чт'
            case weekdays.fr: return 'Пт'
            case weekdays.sa: return 'Сб'
            case weekdays.su: return 'Вс'
        }
    }

    daysBetween(d1, d2) {
        return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24))
    }

    // search = mo | 16.12.2017 | 16.12 | 16
    getBack(search, after = new Date()) {
        //дата
        const date = this.getDate(search)
        if (date) {
            if (date.getTime() <= after.getTime())
                return date
            const slashs = (search + '').split('/').length
            const dots = (search + '').split('.').length
            if (slashs === 2 || dots === 2)
                return this.getChangedDateTime({ years: -1 }, date)
            if (slashs === 1 || dots === 1)
                return this.getChangedDateTime({ months: -1 }, date)
        }
        // день недели
        const weekday = this.getWeekday(search)

        if (weekday != weekdays.unknown) {
            const start = this.getWeekday(after.getDay())
            let diff = 0
            if (start > weekday) {//искомый день на этой неделе
                diff = weekday - start
            } else if (start < weekday) { //искомый день на прошлой неделе
                diff = 7 - start - weekday
                diff = weekday - start - 7
            }
            const res = this.getChangedDateTime({ days: diff }, after)
            return new Date(res.getFullYear(), res.getMonth(), res.getDate())
        }
        return new Date()
    }

    isDateSame(d1, d2) {
        return d1.getFullYear() == d2.getFullYear()
            && d1.getMonth() == d2.getMonth()
            && d1.getDate() == d2.getDate()
    }
}