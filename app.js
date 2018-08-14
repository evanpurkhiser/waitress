import Raven from 'raven-js';
import React from 'react';
import ReactDom from 'react-dom';
import { injectGlobal } from 'react-emotion';

import FileBrowser from './components/fileBrowser';

const environment = process.env.NODE_ENV;

const ravenKey = 'https://2afa25599321471fbc5dd9610bd74804@sentry.io/1256756';
Raven.config(ravenKey, { environment }).install();

injectGlobal`
  @import url('https://fonts.googleapis.com/css?family=Ubuntu:400');

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    color: #595e73;
    font-family: Ubuntu, sans-serif;
  }
`;

ReactDom.render(<FileBrowser />, document.getElementById('container'));
