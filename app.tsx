import {Fragment} from 'react';
import {createRoot} from 'react-dom/client';
import {css, Global} from '@emotion/react';
import * as Sentry from '@sentry/react';

import {FileBrowser} from './components/FileBrowser';
import {colors} from './theme';

Sentry.init({
  dsn: 'https://2afa25599321471fbc5dd9610bd74804@sentry.io/1256756',
  environment: process.env.NODE_ENV,
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 1.0,
});

const globalStyles = css`
  ${colors}

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    color: var(--text);
    background: var(--background);
    font-family: Ubuntu, sans-serif;
  }
`;

const app = (
  <Fragment>
    <Global styles={globalStyles} />
    <FileBrowser />
  </Fragment>
);

createRoot(document.getElementById('container')!).render(app);
