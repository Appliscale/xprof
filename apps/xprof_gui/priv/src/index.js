/* eslint-disable */
/* global document */
import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { Provider } from 'react-redux';

import { RootContainer } from './containers';
import configureStore from './store/configureStore';

import 'bootswatch/flatly/bootstrap.css';
import './main.css';

const render = Component => {
  ReactDOM.render(
    <AppContainer>
      <Provider store={configureStore()}>
        <Component />
      </Provider>
    </AppContainer>,
    document.getElementById('root'),
  );
};

render(RootContainer);

if (module.hot) {
  module.hot.accept('./containers/RootContainer/RootContainer', () => {
    render(RootContainer);
  });
}
