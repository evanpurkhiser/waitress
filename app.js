import prettyBytes from 'pretty-bytes';
import ReactDom from 'react-dom';
import React from 'react';

import { injectGlobal } from 'react-emotion';

import {
  Browser,
  Header,
  Listing,
  ListingItem,
  FileName,
  FileSize,
  FileIcon,
} from './components';

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

function locatePathItem(tree, path) {
  let item = tree;

  if (Object.keys(item).length === 0) return null;

  for (const key of path) {
    item = item.children[key];

    if (item === undefined) return null;
  }

  return item;
}

/**
 * Transform a path list to a URL
 */
const makeUrl = path => '/' + path.map(encodeURIComponent).join('/');

/**
 * Get the path array from the current window location
 */
const getWindowPath = _ =>
  decodeURIComponent(window.location.pathname)
    .split('/')
    .filter(x => x);

const File = p => (
  <ListingItem path={p.path} onClick={p.onClick}>
    <FileIcon path={p.path} isDir={p.isDir} />
    <FileName>{p.name}</FileName>
    <FileSize>{prettyBytes(p.size)}</FileSize>
  </ListingItem>
);

class FileBrowser extends React.Component {
  constructor() {
    super();
    this.state = { loading: true, tree: {}, path: [], lastPath: [] };
  }

  fetchOptions = {
    headers: { Accept: 'application/json' },
  };

  componentDidMount() {
    window.addEventListener('popstate', this.updatePath);
    this.updatePath();
  }

  fetchCurrent = _ =>
    fetch(window.location.pathname, this.fetchOptions)
      .then(r => r.json())
      .then(j => this.setState({ tree: j, loading: false }));

  navigateToPath = path => {
    history.pushState(null, null, makeUrl(path));
    window.scrollTo(0, 0);

    this.updatePath();
  };

  updatePath = _ => {
    this.setState({ path: getWindowPath(), loading: true });
    this.fetchCurrent();
  };

  navigateToItem = (e, target) => {
    const path = [...this.state.path, target];
    const item = locatePathItem(this.state.tree, path) || {};

    if (!item.isDir) return;

    e.preventDefault();
    this.navigateToPath(path);
  };

  navigateHome = _ => this.navigateToPath([]);

  render() {
    const item = locatePathItem(this.state.tree, this.state.path);
    const fileMap = (item && item.children) || {};

    const files = Object.keys(fileMap).sort((a, b) => {
      const c = item.children[a];
      const d = item.children[b];

      return c.isDir == d.isDir ? 0 : c.isDir ? -1 : 1;
    });

    const listItems = files.map(k => (
      <File
        {...item.children[k]}
        key={k}
        name={k}
        path={makeUrl([...this.state.path, k])}
        onClick={e => this.navigateToItem(e, k)}
      />
    ));

    return (
      <Browser>
        <Header
          title="waitress"
          isLoading={this.state.loading}
          onClick={this.navigateHome}
        />
        <Listing>{listItems}</Listing>
      </Browser>
    );
  }
}

ReactDom.render(<FileBrowser />, document.getElementById('container'));
