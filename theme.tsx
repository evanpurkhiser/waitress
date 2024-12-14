import {css} from '@emotion/react';

const colors = css`
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

      --fileBackground: #4a4947;
      --fileCorner: #73726b;
      --file-strip: #73726b;
    }
  }

  @media (prefers-color-scheme: dark) {
    .file-background {
      fill: #4a4947;
    }
    .file-corner {
      fill: #73726b;
    }
    .file-strip {
      fill: #867e7b;
    }
    .folder-front {
      fill: #c5975c;
    }
    .folder-back {
      fill: #a77b4c;
    }
    .folder-text {
      fill: #7e6a54;
    }
  }
`;

export {colors};
