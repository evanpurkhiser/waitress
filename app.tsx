import {Fragment} from 'react';
import {createRoot} from 'react-dom/client';
import {css, Global} from '@emotion/react';
import * as Sentry from '@sentry/react';

import {FileBrowser} from './components/FileBrowser';

Sentry.init({
  dsn: 'https://2afa25599321471fbc5dd9610bd74804@sentry.io/1256756',
  environment: process.env.NODE_ENV,
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 1.0,
});

const globalStyles = css`
  :root {
    --background: #ffffff;
    --text: #595e73;
    --textSearch: #97979c;
    --textAttribute: #888888;
    --textEmpty: #bbbbbb;
    --borderEmpty: #eeeeee;
    --focusBackground: #fafafa;

    --matchbackground: #ffb9d1;
    --matchUnderline: #f23978;

    @media (prefers-color-scheme: dark) {
      --background: #0f0f0f;
      --text: #efefef;
      --textEmpty: #444444;
      --textSearch: #97979c;
      --textAttribute: #888888;
      --borderEmpty: #222222;
      --focusBackground: #1f1f1f;

      --matchbackground: #8c0a31;
      --matchUnderline: #f23978;
    }
  }

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
