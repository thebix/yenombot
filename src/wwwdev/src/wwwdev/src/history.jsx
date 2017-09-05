import React, { Component } from 'react'
import { connect } from 'react-redux'
import classNames from 'classnames'

import '../css/history.scss'

import {
    usersFetch,
    historyFetch,
    historySkipAction
} from './actions'
import Time from '../../../../lib/lib/time' // INFO: bad reference

const timeLib = new Time()

export default connect(state => ({
    historyData: state.historyData,
    historyId: state.historyId,
    users: state.users,
    historySkip: state.historySkip
}))(class History extends Component {
    componentDidMount() {
        const { dispatch, historyId } = this.props
        dispatch(usersFetch())
        dispatch(historyFetch(historyId))
    }
    componentDidUpdate(prevProps) {
        const { dispatch, historyId, historySkip } = this.props
        if (prevProps.historySkip !== historySkip) {
            dispatch(usersFetch())
            dispatch(historyFetch(historyId, historySkip))
        }
    }
    render() {
        const { historyData, users, dispatch, historySkip } = this.props
        const itemsWithTitles = []
        for (let i = 0; i < historyData.length; i += 1) {
            if (i === 0
                || timeLib.getStartDate(new Date(historyData[i - 1].date_create)).getTime() !==
                timeLib.getStartDate(new Date(historyData[i].date_create)).getTime())
                itemsWithTitles.push({
                    id: i + 100500, // TODO: normal keys for titles
                    date_create: historyData[i].date_create
                    // category: timeLib.dateString(new Date(historyData[i].date_create))
                })
            itemsWithTitles.push(historyData[i])
        }

        const historyRows = itemsWithTitles.map(item => {
            let user = ''
            if (users && users[item.user_id])
                user = `${users[item.user_id].firstName} ${users[item.user_id].lastName}`
            return (<Row key={item.id} item={item}
                user={user} />)
        })
        return (
            <div className="table-history">
                <div className="table-header">
                    <div className="table-header-cell">
                        <input type="button" value="<<" onClick={() => {
                            dispatch(historySkipAction(-1))
                        }
                        } />
                        <input type="button" value="<< 50" onClick={() => {
                            const skip = historySkip !== -1 ? historySkip + 50 : -1
                            dispatch(historySkipAction(skip))
                        }
                        } />
                        <input type="button" value="50 >>" onClick={() => {
                            const skip = historySkip && (historySkip > 50) !== -1 ? historySkip - 50 : 0
                            dispatch(historySkipAction(skip))
                        }
                        } />
                        <input type="button" value=">>" onClick={() => {
                            dispatch(historySkipAction(0))
                        }
                        } />
                    </div>
                </div>
                <div className="table-content">
                    {historyRows}
                </div>
            </div>
        )
    }
})

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
