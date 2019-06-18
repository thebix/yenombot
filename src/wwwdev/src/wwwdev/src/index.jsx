import React from 'react'
import { render } from 'react-dom'
// eslint-disable-next-line no-unused-vars
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
// eslint-disable-next-line no-unused-vars
import { AppContainer } from 'react-hot-loader'
import appReducer from './reducers'
// eslint-disable-next-line no-unused-vars
import App from './app.jsx'

const store = createStore(
    appReducer,
    applyMiddleware(thunkMiddleware)
)

// eslint-disable-next-line no-undef
render(<AppContainer><Provider store={store}><App /></Provider></AppContainer>, document.querySelector('#app'));

if (module && module.hot) {
    module.hot.accept('./app', () => {
        render(
            <AppContainer>
                <Provider store={store}>
                    <App />
                </Provider>
            </AppContainer>,
            // eslint-disable-next-line no-undef
            document.querySelector('#app')
        );
    });
}
