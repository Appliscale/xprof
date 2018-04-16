

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', (err) => {
  throw err;
});

// Ensure environment variables are read.
require('../config/env');

const webpack = require('webpack');
const openBrowser = require('react-dev-utils/openBrowser');
const config = require('../config/webpack.config.dev');
const chalk = require('chalk');

const compiler = webpack(config);

console.log(chalk.cyan('[FRONTEND] Starting webpack in watch mode.'));
const watching = compiler.watch({
  aggregateTimeout: 300,
  poll: undefined
}, (err, stats) => {
  console.log(chalk.cyan('[FRONTEND] Frontend has been rebuilt.'));
});

setTimeout(() => {
  console.log(chalk.cyan('[FRONTEND] Opening browser ...'));
  openBrowser('http://localhost:7890');
}, 2000);

