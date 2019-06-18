import React, { Component } from 'react'
import '../css/index.scss'

// eslint-disable-next-line no-unused-vars
import History from './history.jsx'

import l from '../../logger'

export default class App extends Component {
    render() {
        l.d('App render')
        return (
            <div>
                {/* <Header /> */}
                <div id="content">
                    <History />
                </div>
                {/* <Footer /> */}
            </div>
        )
    }
}
