import {Fragment} from 'react';
import {createRoot} from 'react-dom/client';
import {css, Global} from '@emotion/react';
import * as Sentry from '@sentry/react';
import {Integrations} from '@sentry/tracing';

import FileBrowser from './components/fileBrowser';

Sentry.init({
  dsn: 'https://2afa25599321471fbc5dd9610bd74804@sentry.io/1256756',
  environment: process.env.NODE_ENV, // eslint-disable-line no-undef
  integrations: [new Integrations.BrowserTracing()],
  tracesSampleRate: 1.0,
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
  <Fragment>
    <Global styles={globalStyles} />
    <FileBrowser />
  </Fragment>
);

createRoot(document.getElementById('container')).render(app);
