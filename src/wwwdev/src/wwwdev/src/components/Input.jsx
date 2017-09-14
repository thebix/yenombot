import React, { Component } from 'react'
import classNames from 'classnames'

const Input = ({
    placeholder,
    value,
    onBlur = () => { },
    onChange = () => { },
    onKeyPress = () => { },
    defaultValue,
    classes = []
}) =>
    <input value={value}
        onBlur={onBlur}
        placeholder={placeholder}
        className={classNames('input', classes)}
        onChange={event => onChange(event.target.value)}
        defaultValue={defaultValue}
        onKeyPress={event => onKeyPress(event.charCode)} />

export default Input

export class InputStatefull extends Component {
    constructor(props) {
        super(props)
        this.state = { value: props.defaultValue }
    }
    render() {
        const { placeholder,
            onBlur = () => { },
            onChange = () => { },
            onKeyPress = () => { },
            classes,
            defaultValue } = this.props
        const { value } = this.state
        return <Input
            defaultValue={defaultValue}
            onBlur={() => onBlur(value)}
            placeholder={placeholder}
            classes={classes}
            onChange={val => {
                onChange(val)
                this.setState({ value: val })
            }}
            onKeyPress={char => onKeyPress(char, value)}
        />
    }
}
