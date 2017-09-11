import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

export const CheckBoxStateless = ({ checked, onClick, title, classes }) => {
    let checkbox = <input className={classNames(classes)} type="checkbox" checked={checked ? 'checked' : ''} onChange={() => onClick()} />
    if (title)
        checkbox = <span className={classNames('check', classes)}>{checkbox}{title}</span >
    return checkbox
}
export class CheckBoxStatefull extends Component {
    constructor(props) {
        super(props);
        const { checked } = props
        this.state = { checked: !!checked };
        this.onClick = this.onClick.bind(this)
    }
    onClick() {
        const { stateUpdate } = this.props
        const { checked } = this.state
        if (typeof stateUpdate === 'function') stateUpdate(!checked)
        this.setState({ checked: !checked })
    }
    render() {
        const { title, classes } = this.props
        const { checked } = this.state
        return <CheckBoxStateless
            checked={checked}
            classes={classes}
            onClick={this.onClick}
            title={title} />
    }
}

// https://github.com/facebook/prop-types#prop-types
CheckBoxStatefull.propTypes = {
    optionalFunc: PropTypes.func,
    optionalString: PropTypes.string
}
