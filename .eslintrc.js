/* eslint-env node */
module.exports = {
  env: {browser: true},
  extends: ['@evanpurkhiser'],

  settings: {
    // Using preact, be explicit about the version
    react: {version: '17.0'},
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
  },
};
