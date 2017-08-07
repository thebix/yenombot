import React, { Component } from 'react'
import '../css/index.scss'

import Header from './header.jsx'
import Footer from './footer.jsx'
import History from './history.jsx'

export default class App extends Component {
    render() {
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
