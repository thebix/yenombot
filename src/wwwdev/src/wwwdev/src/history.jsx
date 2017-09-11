import React, { Component } from 'react'
import { connect } from 'react-redux'
import classNames from 'classnames'

import { CheckBoxStatefull, CheckBoxStateless } from './components/CheckBox.jsx'
import Dynamic from './components/Dynamic.jsx'
import Input from './components/Input.jsx'

import '../css/history.scss'

import l from '../../logger'
import {
    usersFetch,
    historyFetch,
    historySkipAction,
    categoriesFetch,
    historyCategoryToggle,
    historyCategoriesSelected,
    historyUserToggle,
    historyDateSet
} from './actions'

import Time from '../../../../lib/lib/time' // INFO: bad reference

const HISTORY_PAGE_COUNT = 150

const timeLib = new Time()

const TableHeaderCell = ({ children, classes = [] }) => <div className={classNames('table-header-cell', classes)}>{children}</div>

const checkDateInput = value => {
    const current = new Date()
    const backDate = timeLib.getBack(value)
    if (current.getTime() > backDate.getTime()) {
        return backDate
    }
    return null
}

const fetchHistory = ({
    dispatch,
    historyId,
    historySkip,
    selectedCategories,
    selectedUsers,
    selectedDates }) => {
    l.d('History:fetchHistory()')
    // TODO: move this request to other lyfecycle method
    dispatch(usersFetch())
    const { dateStart, dateEnd } = selectedDates
    const start = checkDateInput(dateStart)
    let end = checkDateInput(dateEnd)

    if (end) {
        const currentDate = new Date()
        end = timeLib.isDateSame(currentDate, end)
            ? currentDate
            : timeLib.getChangedDateTime({ days: 1 }, end)
    }

    dispatch(historyFetch(historyId, historySkip, selectedCategories, selectedUsers,
        start ? start.getTime() : null,
        end ? end.getTime() : null))
}

export default connect(state => ({
    historyData: state.historyData,
    historyId: state.historyId,
    users: state.users,
    historySkip: state.historySkip,
    categories: state.historyCategories,
    selectedCategories: state.historySelectedCategories,
    selectedUsers: state.historySelectedUsers,
    selectedDates: state.historySelectedDates
}))(class History extends Component {
    constructor(props) {
        super(props)
        const { dispatch, historyId } = this.props
        const date = new Date()
        dispatch(historyDateSet(timeLib.dateString(new Date(date.setDate(1)))))
        dispatch(historyDateSet(timeLib.dateString(), false))

        dispatch(usersFetch())
        dispatch(historyFetch(historyId))
        dispatch(categoriesFetch(historyId))
    }
    componentDidUpdate(prevProps) {
        // l.d('componentDidUpdate')
        const {
            historySkip,
            selectedCategories,
            selectedUsers,
            selectedDates
        } = this.props
        if (prevProps.historySkip !== historySkip
            || prevProps.selectedCategories !== selectedCategories
            || prevProps.selectedUsers !== selectedUsers
            || (prevProps.selectedDates !== null && selectedDates !== null
                && !prevProps.selectedDates.dateStart
                && !prevProps.selectedDates.dateEnd
                && selectedDates.dateStart
                && selectedDates.dateEnd)
        ) {
            // l.d('and passed if')
            fetchHistory(this.props)
        }
    }
    render() {
        // l.d('History.render()')
        const {
            historyData,
            users,
            dispatch,
            historySkip,
            categories,
            selectedCategories,
            selectedUsers,
            selectedDates
        } = this.props
        const itemsWithTitles = []
        for (let i = 0; i < historyData.data.length; i += 1) {
            if (i === 0
                || timeLib.getStartDate(new Date(historyData.data[i - 1].date_create)).getTime() !==
                timeLib.getStartDate(new Date(historyData.data[i].date_create)).getTime())
                itemsWithTitles.push({
                    id: i + 100500, // TODO: normal keys for titles
                    date_create: historyData.data[i].date_create
                })
            itemsWithTitles.push(historyData.data[i])
        }

        const historyRows = itemsWithTitles.map(item => {
            let user = ''
            if (users && users[item.user_id])
                user = `${users[item.user_id].firstName} ${users[item.user_id].lastName}`
            return (<Row key={item.id} item={item} user={user} />)
        })
        return (
            <div className="table-history">
                <div className="table-header">
                    <div className="table-header-row">
                        <Navigation props={this.props} />
                    </div>
                    <div className="table-header-row table-header-filters">
                        <Categories
                            categories={categories}
                            dispatch={dispatch}
                            selected={selectedCategories} />
                        <TableHeaderCell classes={['padding-right-7']}>
                            <Users
                                users={users}
                                dispatch={dispatch}
                                selected={selectedUsers} />
                            <Dates
                                selected={selectedDates}
                                dispatch={dispatch}
                                doUpdate={() => fetchHistory(this.props)} />
                        </TableHeaderCell>
                    </div>
                </div>
                <div className="table-content">
                    {historyRows}
                </div>
            </div >
        )
    }
})

const Navigation = ({ props }) => {
    // l.d('History.Navigation()')
    const { selectedDates,
        dispatch = () => { },
        historySkip = 0,
        historyData = { meta: { lengh: 0 }, data: [] }
    } = props
    // const propsFixed = { ...props }
    const { meta, data } = historyData
    const historyLength = meta.length

    const dtStart = checkDateInput(selectedDates ? selectedDates.dateStart : 'NONE')
    return <TableHeaderCell classes={['fixed']}>
        <input
            type="button" value="< 1 month"
            disabled={!dtStart || (dtStart.getMonth() <= 4
                && dtStart.getFullYear() <= 2015)}
            onClick={() => {
                let start = checkDateInput(selectedDates.dateStart)
                if (start) {
                    start = timeLib.getMonthStartDate(
                        timeLib.getChangedDateTime({ months: -1 }, start))

                    const dateStart = timeLib.dateString(start)
                    dispatch(historyDateSet(dateStart))
                    const dateEnd =
                        timeLib.dateString(timeLib.getMonthEndDate(start))
                    dispatch(historyDateSet(dateEnd, false))
                    dispatch(historySkipAction(0))
                    fetchHistory({
                        ...props,
                        historySkip: 0,
                        selectedDates: { dateStart, dateEnd }
                    })
                }
            }} />
        <input disabled={historySkip === -1 || (historyLength <= data.length + historySkip)}
            type="button" value="<<"
            onClick={() => {
                dispatch(historySkipAction(-1))
            }} />
        <input disabled={historySkip === -1 || (historyLength <= data.length + historySkip)}
            type="button"
            value={`<< ${HISTORY_PAGE_COUNT}`} onClick={() => {
                const skip = historySkip !== -1 ? historySkip + HISTORY_PAGE_COUNT : -1
                dispatch(historySkipAction(skip))
            }} />
        <input disabled={historySkip === 0} type="button" value={`${HISTORY_PAGE_COUNT} >>`} onClick={() => {
            const skip = historySkip
                && (historySkip > HISTORY_PAGE_COUNT) !== -1 ? historySkip - HISTORY_PAGE_COUNT : 0
            dispatch(historySkipAction(skip))
        }} />
        <input disabled={historySkip === 0} type="button" value=">>" onClick={() => {
            dispatch(historySkipAction(0))
        }} />
        <input
            type="button" value="1 month >"
            disabled={!dtStart || (dtStart.getMonth() >= new Date().getMonth()
                && dtStart.getFullYear() >= new Date().getFullYear())}
            onClick={() => {
                let start = checkDateInput(selectedDates.dateStart)
                if (start) {
                    start = timeLib.getMonthStartDate(
                        timeLib.getChangedDateTime({ months: 1 }, start))
                    const current = new Date()
                    const end = current.getFullYear() === start.getFullYear()
                        && current.getMonth() === start.getMonth()
                        ? current
                        : timeLib.getMonthEndDate(start)
                    start = timeLib.getMonthStartDate(start)
                    const dateStart = timeLib.dateString(start)
                    dispatch(historyDateSet(dateStart))
                    const dateEnd = timeLib.dateString(end)
                    dispatch(historyDateSet(dateEnd, false))
                    dispatch(historySkipAction(0))
                    fetchHistory({
                        ...props,
                        historySkip: 0,
                        selectedDates: { dateStart, dateEnd }
                    })
                }
            }} />
        <input
            type="button" value="today"
            disabled={!dtStart || (dtStart.getMonth() >= new Date().getMonth()
                && dtStart.getFullYear() >= new Date().getFullYear())}
            onClick={() => {
                const end = new Date()
                const start = timeLib.getMonthStartDate(end)
                const dateStart = timeLib.dateString(start)
                const dateEnd = timeLib.dateString(end)
                dispatch(historyDateSet(dateStart))
                dispatch(historyDateSet(dateEnd, false))
                dispatch(historySkipAction(0))
                fetchHistory({
                    ...props,
                    historySkip: 0,
                    selectedDates: { dateStart, dateEnd }
                })
            }} />
    </TableHeaderCell>
}

const Categories = ({ categories, dispatch, selected, }) => {
    let cell0 = [],
        cell1,
        cell2
    const categoryMapper = category => <div key={category.id}>
        <CheckBoxStateless key={category.id} title={category.title}
            checked={selected.indexOf(category.title) > -1}
            onClick={() => {
                dispatch(historySkipAction(0))
                dispatch(historyCategoryToggle(category.title))
            }} />
    </div>
    if (categories && categories.length > 0) {
        cell0.push(<span key={3}>
            <CheckBoxStatefull stateUpdate={state => {
                dispatch(historySkipAction(0))
                if (state) {
                    dispatch(historyCategoriesSelected(categories.map(item => item.title)))
                } else {
                    dispatch(historyCategoriesSelected())
                }
            }} />
            <CheckBoxStatefull classes={['margin-left-8']} title='uncat' stateUpdate={() => {
                dispatch(historySkipAction(0))
                dispatch(historyCategoryToggle('uncat'))
            }} />
        </span>)
        if (categories.length < 8) {
            cell0 = cell0.concat(categories.map(categoryMapper))
        } else {
            const cellLength = categories.length / 3
            cell0 = cell0.concat(categories.slice(0, cellLength).map(categoryMapper))
            cell1 = categories.slice(cellLength, cellLength * 2).map(categoryMapper)
            cell2 = categories.slice(cellLength * 2).map(categoryMapper)
        }
    }
    return <span><TableHeaderCell classes={['padding-right-7']} key={0}>{cell0}</TableHeaderCell>
        {cell1 && <TableHeaderCell classes={['padding-right-7']} key={1}>{cell1}</TableHeaderCell>}
        {cell2 && <TableHeaderCell classes={['padding-right-7']} key={2}>{cell2}</TableHeaderCell>}</span>
}

const Users = ({ users, dispatch, selected }) => {
    if (!users) return null
    const selUsers = Array.isArray(selected) ? selected : []
    const usersIds = Object.keys(users)
    return <div>
        {usersIds.map(id => <div key={id}><CheckBoxStateless key={id} title={`${users[id].firstName} ${users[id].lastName}`}
            checked={selUsers.indexOf(id) > -1}
            onClick={() => {
                dispatch(historySkipAction(0))
                dispatch(historyUserToggle(id))
            }} /></div>)}
    </div>
}

const Dates = ({ dispatch, selected, doUpdate }) => {
    if (!selected) return null
    const { dateStart, dateEnd } = selected
    const start = checkDateInput(dateStart)
    const end = checkDateInput(dateEnd)

    return <div className="margin-top-2">
        <div><Input value={timeLib.dateString(dateStart)} placeholder={start ? timeLib.dateString(timeLib.getStartDate(start)) : ''}
            classes={[(start && dateStart) ? 'allowed' : 'not-allowed', 'width-80']}
            onChange={value => dispatch(historyDateSet(String.trim(value)))}
            onBlur={() => {
                dispatch(historySkipAction(0))
                doUpdate()
            }}
        />{start ? `  ${start.toDateString()}` : null}</div>
        <div><Input value={timeLib.dateString(dateEnd)} placeholder={end ? timeLib.dateString(timeLib.getStartDate(end)) : ''}
            classes={[(end && dateEnd) ? 'allowed' : 'not-allowed', 'width-80']}
            onChange={value => dispatch(historyDateSet(String.trim(value), false))}
            onBlur={() => {
                dispatch(historySkipAction(0))
                doUpdate()
            }} />{end ? `  ${end.toDateString()}` : null}</div>
    </div>
}

const Row = ({ item, user }) => {
    if (!user) {
        return (<div className="table-row-title">
            {timeLib.dateString(new Date(item.date_create))}</div>)
    }
    return (
        <div className={classNames('table-row', {
            'table-row-deleted': !!item.date_delete
        })}>
            <div className="table-cell" style={{ color: 'grey' }}>
                {item.id}
            </div>
            <div className="table-cell" style={{ paddingLeft: '7px' }}>
                {timeLib.dateTimeString(new Date(item.date_create))}
            </div>
            <div className={classNames('table-cell', {
                warning: item.category === 'uncat' && !item.date_delete
            })} style={{ paddingLeft: '7px', width: '130px' }}>
                {item.category}
            </div>
            <div className="table-cell" style={{ width: '65px' }}>
                {item.value}
            </div>
            <div className="table-cell" style={{ width: '150px' }}>
                {user}
            </div>
            <div className="table-cell">
                {item.comment}
            </div>
        </div>)
}
