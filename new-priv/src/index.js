import { AppContainer } from 'react-hot-loader';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import configureStore from './store/configureStore';
import './index.css';
import App from './app';
import registerServiceWorker from './utils';

const store = configureStore();

const render = () => {
  const providerContainer = React.createElement(Provider, { store }, App());
  const hotContainer = React.createElement(AppContainer, null, providerContainer);
  ReactDOM.render(hotContainer, document.getElementById('root'));
};

render();
registerServiceWorker();

if (module.hot) {
  module.hot.accept('./app', () => {
    render();
  });
}
