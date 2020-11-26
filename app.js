import React from 'react';
import ReactDom from 'react-dom';
import {css, Global} from '@emotion/core';
import * as Sentry from '@sentry/browser';

import FileBrowser from './components/fileBrowser';

Sentry.init({
  dsn: 'https://2afa25599321471fbc5dd9610bd74804@sentry.io/1256756',
  environment: process.env.NODE_ENV, // eslint-disable-line no-undef
});

const globalStyles = css`
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    color: #595e73;
    font-family: Ubuntu, sans-serif;
  }
`;

const app = (
  <React.Fragment>
    <Global styles={globalStyles} />
    <FileBrowser />
  </React.Fragment>
);

ReactDom.render(app, document.getElementById('container'));
