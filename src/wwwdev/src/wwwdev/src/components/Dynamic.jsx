import React from 'react'
import classNames from 'classnames'

export default ({ title, onClick, classes = [] }) =>
    <span className={classNames('dynamic', classes)} onClick={onClick}>{title}</span>
