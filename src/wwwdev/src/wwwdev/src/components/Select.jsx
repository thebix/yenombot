import React from 'react'

export default ({ items, selected, onChange = () => { } }) =>
    <select defaultValue={selected}
        onChange={event => onChange(event.target.value)}>
        {items.map(item =>
            <option
                value={item}
                key={item}>{item}</option>)}
    </select>
