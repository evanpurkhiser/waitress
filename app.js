import { Global, css } from '@emotion/core';
import * as Sentry from '@sentry/browser';
import React from 'react';
import ReactDom from 'react-dom';

import FileBrowser from './components/fileBrowser';

Sentry.init({
  dsn: 'https://2afa25599321471fbc5dd9610bd74804@sentry.io/1256756',
  environment: process.env.NODE_ENV,
});

const globalStlyes = css`
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
  <Global styles={globalStyles}>
    <FileBrowser />
  </Global>
);

ReactDom.render(app, document.getElementById('container'));
