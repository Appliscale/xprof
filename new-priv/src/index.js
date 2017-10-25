import { AppContainer } from 'react-hot-loader';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

const render = () => {
  ReactDOM.render(React.createElement(AppContainer, null, App()), document.getElementById('root'));
};

render();
registerServiceWorker();

if (module.hot) {
  module.hot.accept('./App', () => {
    render();
  });
}
