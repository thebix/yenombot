import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import { AppContainer } from 'react-hot-loader'
import appReducer from './reducers'
import App from './app.jsx'

const store = createStore(
    appReducer,
    applyMiddleware(thunkMiddleware)
)

render(<AppContainer><Provider store={store}><App /></Provider></AppContainer>, document.querySelector('#app'));

if (module && module.hot) {
    module.hot.accept('./app', () => {
        render(
            <AppContainer>
                <Provider store={store}>
                    <App />
                </Provider>
            </AppContainer>,
            document.querySelector('#app')
        );
    });
}
