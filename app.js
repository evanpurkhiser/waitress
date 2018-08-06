import ReactDom from 'react-dom';
import React from 'react';
import { injectGlobal } from 'react-emotion';

import FileBrowser from './components/fileBrowser';

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
