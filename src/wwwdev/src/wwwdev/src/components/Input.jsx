import React from 'react'
import classNames from 'classnames'

export default ({ placeholder, value, onChange, onBlur, classes = [] }) =>
    <input value={value}
        onBlur={onBlur}
        placeholder={placeholder}
        className={classNames('input', classes)}
        onChange={event => onChange(event.target.value)} />
