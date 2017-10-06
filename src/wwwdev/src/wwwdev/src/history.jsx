import React, { Component } from 'react'
import { connect } from 'react-redux'
import classNames from 'classnames'
import { Parser } from 'expr-eval'

import { CheckBoxStatefull, CheckBoxStateless } from './components/CheckBox.jsx'
import Dynamic from './components/Dynamic.jsx'
import Input, { InputStatefull } from './components/Input.jsx'
import Select from './components/Select.jsx'

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
    historyDateSet,
    historyEditSwitch,
    historySave,
    historySaveUndo,
    historyShouldUpdate
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
    dispatch(historyEditSwitch())
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
    selectedDates: state.historySelectedDates,
    historyEditId: state.historyEditId,
    historyEditUndo: state.historyEditUndo,
    historyUpdate: state.historyUpdate
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
            selectedDates,
            historyUpdate
        } = this.props
        if (prevProps.historySkip !== historySkip
            || prevProps.selectedCategories !== selectedCategories
            || prevProps.selectedUsers !== selectedUsers
            || (prevProps.selectedDates !== null && selectedDates !== null
                && !prevProps.selectedDates.dateStart
                && !prevProps.selectedDates.dateEnd
                && selectedDates.dateStart
                && selectedDates.dateEnd)
            || (!prevProps.historyUpdate && historyUpdate)
        ) {
            fetchHistory(this.props)
        }
    }
    render() {
        // l.d('History.render()')
        const {
            historyData,
            users,
            dispatch,
            categories,
            selectedCategories,
            selectedUsers,
            selectedDates,
            historyEditId,
            historyId
        } = this.props
        const { data, meta } = historyData

        const itemsWithTitles = []
        const sorted = data.sort((a, b) =>
            new Date(b.date_create).getTime() - new Date(a.date_create).getTime())
        for (let i = 0; i < sorted.length; i += 1) {
            if (i === 0
                || timeLib.getStartDate(new Date(sorted[i - 1].date_create)).getTime() !==
                timeLib.getStartDate(new Date(sorted[i].date_create)).getTime())
                itemsWithTitles.push({
                    id: i + 100500, // TODO: normal keys for titles
                    date_create: sorted[i].date_create
                })
            itemsWithTitles.push(sorted[i])
        }

        const historyRows = itemsWithTitles.map(item => {
            let user = ''
            if (users && users[item.user_id])
                user = `${users[item.user_id].firstName} ${users[item.user_id].lastName}`
            return <Row key={item.id}
                chatId={historyId}
                item={item}
                user={user}
                categories={categories}
                editId={historyEditId}
                dispatch={dispatch} />
        })
        return <div className="table-history">
            <div className="table-header">
                <div className="table-header-row">
                    <Navigation props={this.props} />
                </div>
                <div className="table-header-row table-header-filters">
                    <Categories
                        categories={categories}
                        activeCategories={meta.activeCategories}
                        dispatch={dispatch}
                        selected={selectedCategories} />
                    <TableHeaderCell classes={['padding-right-7']}>
                        <Users
                            users={users}
                            dispatch={dispatch}
                            selected={selectedUsers}
                            activeUsersIds={meta.activeUsersIds} />
                        <Dates
                            selected={selectedDates}
                            dispatch={dispatch} />
                    </TableHeaderCell>
                </div>
            </div>
            <div className="table-content">
                {historyRows}
            </div>
        </div >
    }
})

const Navigation = ({ props }) => {
    // l.d('History.Navigation()')
    const { selectedDates,
        historyEditUndo,
        historyEditId,
        dispatch = () => { },
        historySkip = 0,
        historyData = { meta: { lengh: 0 }, data: [] }
    } = props
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
                    dispatch(historyShouldUpdate())
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
                    dispatch(historyShouldUpdate())
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
                dispatch(historyShouldUpdate())
            }} />
        <input
            type="button" value="undo"
            disabled={!historyEditUndo || !historyEditUndo.chatId || historyEditId}
            onClick={() => {
                dispatch(historySave(historyEditUndo.chatId,
                    historyEditUndo.id,
                    historyEditUndo.changes))
            }} />
    </TableHeaderCell>
}

const Categories = ({ categories, dispatch, selected, activeCategories }) => {
    let cell0 = [],
        cell1,
        cell2
    const actCategories = activeCategories || []
    const categoryMapper = category => <div key={category.id}>
        <CheckBoxStateless key={category.id} title={category.title}
            classes={[actCategories.indexOf(category.title) === -1 ? 'color-grey-light' : '']}
            checked={selected.indexOf(category.title) > -1}
            onClick={() => {
                dispatch(historySkipAction(0))
                dispatch(historyCategoryToggle(category.title))
            }} />
    </div>
    if (categories && categories.length > 0) {
        cell0.push(<span key={-1}>
            <CheckBoxStatefull stateUpdate={state => {
                dispatch(historySkipAction(0))
                if (state) {
                    dispatch(historyCategoriesSelected(categories.map(item => item.title)))
                } else {
                    dispatch(historyCategoriesSelected())
                }
            }} />
            <CheckBoxStatefull classes={['margin-left-8', actCategories.indexOf('uncat') === -1 ? 'color-grey-light' : '']} title='uncat' stateUpdate={() => {
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

const Users = ({ users, dispatch, selected, activeUsersIds }) => {
    if (!users) return null
    const selUsers = Array.isArray(selected) ? selected : []
    const usersIds = Object.keys(users)
    const actUsersIds = activeUsersIds || []
    return <div>
        {usersIds.map(id => <div key={id}><CheckBoxStateless key={id} title={`${users[id].firstName} ${users[id].lastName}`}
            classes={[actUsersIds.indexOf(+id) === -1 ? 'color-grey-light' : '']}
            checked={selUsers.indexOf(id) > -1}
            onClick={() => {
                dispatch(historySkipAction(0))
                dispatch(historyUserToggle(id))
            }} /></div>
        )}
    </div>
}

const Dates = ({ dispatch, selected }) => {
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
                dispatch(historyShouldUpdate())
            }}
            onKeyPress={char => {
                if (char === 13) {
                    dispatch(historySkipAction(0))
                    dispatch(historyShouldUpdate())
                }
            }}
        />{start ? `  ${start.toDateString()}` : null}</div>
        <div><Input value={timeLib.dateString(dateEnd)} placeholder={end ? timeLib.dateString(timeLib.getStartDate(end)) : ''}
            classes={[(end && dateEnd) ? 'allowed' : 'not-allowed', 'width-80']}
            onChange={value => dispatch(historyDateSet(String.trim(value), false))}
            onBlur={() => {
                dispatch(historySkipAction(0))
                dispatch(historyShouldUpdate())
            }}
            onKeyPress={char => {
                if (char === 13) {
                    dispatch(historySkipAction(0))
                    dispatch(historyShouldUpdate())
                }
            }} />{end ? `  ${end.toDateString()}` : null}</div>
    </div>
}

const Row = ({ chatId, item, user, categories, editId, dispatch }) => {
    if (!user) {
        return (<div className="table-row-title">
            {timeLib.dateString(new Date(item.date_create))}</div>)
    }
    const isEdit = editId === item.id
    return <div className={classNames('table-row', {
        'table-row-deleted': !!item.date_delete
    })} onClick={() => { dispatch(historyEditSwitch(item.id)) }}>
        <div className="table-cell" style={{ color: 'grey' }}>
            {item.id}
        </div>
        <div className="table-cell" style={{ paddingLeft: isEdit ? '' : '7px' }}>
            {!isEdit && <span>{timeLib.dateTimeString(new Date(item.date_create))} </span>}
            {isEdit && <InputStatefull
                defaultValue={timeLib.dateTimeString(new Date(item.date_create))}
                classes={['width-125']}
                onBlur={dateString => {
                    const dt = timeLib.getDateTime(dateString)
                    if (dt) {
                        dispatch(historySaveUndo(chatId, item.id,
                            { date_create: item.date_create }))
                        dispatch(historySave(chatId, item.id, { date_create: dt }))
                    }
                }}
                onKeyPress={(char, dateString) => {
                    if (char === 13) {
                        const dt = timeLib.getDateTime(dateString)
                        dispatch(historySaveUndo(chatId, item.id,
                            { date_create: item.date_create }))
                        dispatch(historySave(chatId, item.id, { date_create: dt }))
                        dispatch(historyEditSwitch())
                    }
                }} />}
        </div>
        <div className={classNames('table-cell', {
            warning: item.category === 'uncat' && !item.date_delete
        })} style={{ paddingLeft: isEdit ? '' : '7px', width: '140px' }}>
            {!isEdit && <span>{item.category}</span>}
            {isEdit && <Select items={categories.map(cat => cat.title)}
                selected={item.category}
                onChange={value => {
                    dispatch(historySaveUndo(chatId, item.id, { category: item.category }))
                    dispatch(historySave(chatId, item.id, { category: value }))
                }} />}
        </div>
        <div className="table-cell" style={{ width: '65px' }}>
            {!isEdit && <span>{item.value ? item.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : ''}</span>}
            {isEdit && <InputStatefull defaultValue={item.value}
                classes={['width-55']}
                onBlur={value => {
                    const parser = new Parser()
                    try {
                        const text = parser.parse(value).evaluate()
                        dispatch(historySaveUndo(chatId, item.id, { value: item.value }))
                        dispatch(historySave(chatId, item.id, { value: text }))
                    } catch (ex) {
                        // no-op
                    }
                }}
                onKeyPress={(char, value) => {
                    if (char === 13) {
                        const parser = new Parser()
                        try {
                            const text = parser.parse(value).evaluate()
                            dispatch(historySaveUndo(chatId, item.id, { value: item.value }))
                            dispatch(historySave(chatId, item.id, { value: text }))
                        } catch (ex) {
                            // no-op
                        }
                        dispatch(historyEditSwitch())
                    }
                }} />}
        </div>
        <div className="table-cell" style={{ width: '150px' }}>
            <span>{user}</span>
        </div>
        <div className="table-cell">
            {!isEdit && <span>{item.comment} </span>}
            {isEdit && <InputStatefull defaultValue={item.comment}
                classes={['width-320']}
                onBlur={comment => {
                    dispatch(historySaveUndo(chatId, item.id, { comment: item.comment }))
                    dispatch(historySave(chatId, item.id, { comment }))
                }}
                onKeyPress={(char, comment) => {
                    if (char === 13) {
                        dispatch(historySaveUndo(chatId, item.id, { comment: item.comment }))
                        dispatch(historySave(chatId, item.id, { comment }))
                        dispatch(historyEditSwitch())
                    }
                }} />}
        </div>
    </div>
}
