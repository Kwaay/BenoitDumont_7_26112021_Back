const path = require('path');

module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
  extends: ['airbnb-base'],
  // add your custom rules here
  rules: {},
  settings: {
    'import/resolver': {
      alias: {
        extensions: ['.js', '.json'],
        map: [
          ['~', path.resolve(__dirname, './')],
          ['@', path.resolve(__dirname, './')],
        ],
      },
    },
  },
};
