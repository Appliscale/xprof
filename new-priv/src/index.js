import { AppContainer } from 'react-hot-loader';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import configureStore from './store/configureStore';
import './index.css';
import App from './containers/App';
import registerServiceWorker from './utils';

const render = (component) => {
  const providerContainer = React.createElement(Provider, { store: configureStore() }, component());
  const hotContainer = React.createElement(AppContainer, null, providerContainer);
  ReactDOM.render(hotContainer, document.getElementById('root'));
};

render(App);
registerServiceWorker();

if (module.hot) {
  module.hot.accept('./containers/App', () => {
    render(App);
  });
}
