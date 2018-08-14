import React from 'react';
import prettyBytes from 'pretty-bytes';
import styled from 'react-emotion';

import { Header, Listing, ListingItem, FileName, FileSize, FileIcon } from '.';

/**
 * Transform a path list to a URL
 */
const makeUrl = path => '/' + path.map(encodeURIComponent).join('/');

/**
 * Locate the path within an object.
 */
function locate(object, path, defaultValue) {
  let index = 0;
  const length = path.length;

  while (object && object.children && index < length) {
    object = object.children[path[index++]];
  }

  return index === length ? object : defaultValue;
}

const File = p => (
  <ListingItem path={p.path} onClick={p.onClick}>
    <FileIcon path={p.path} isDir={p.isDir} />
    <FileName>{p.name}</FileName>
    <FileSize>{prettyBytes(p.size)}</FileSize>
  </ListingItem>
);

export default class FileBrowser extends React.Component {
  state = {
    loading: false,
    tree: {},
    path: [],
    lastPath: [],
  };

  fetchOptions = {
    headers: { Accept: 'application/json' },
  };

  componentDidMount() {
    window.addEventListener('popstate', this.updatePath);
    this.updatePath();
    this.cancelPending();
  }

  cancelPending() {
    if (this.fetchAborter != undefined) {
      this.fetchAborter.abort();
    }

    // The fetch aborter may only be signaled once, setup a new aborter for the
    // next request to be made.
    this.fetchAborter = new AbortController();
    this.fetchOptions.signal = this.fetchAborter.signal;
  }

  navigateToPath(path) {
    history.pushState(null, null, makeUrl(path));
    window.scrollTo(0, 0);

    this.updatePath();
  }

  navigateToItem(e, target) {
    const path = [...this.state.path, target];
    const item = locate(this.state.tree, path, {});

    console.log(this.state.tree);

    if (!item.isDir) return;

    e.preventDefault();
    this.navigateToPath(path);
  }

  fetchCurrent = _ =>
    fetch(makeUrl(this.state.path), this.fetchOptions)
      .then(r => r.json())
      .then(j => this.setState({ tree: j, loading: false }))
      .catch(_ => this.setState({ loading: false }));

  updatePath = _ => {
    const lastPath = this.state.path;
    const path = decodeURIComponent(window.location.pathname)
      .split('/')
      .filter(x => x);

    this.cancelPending();
    this.setState({ path, lastPath, loading: true }, _ => this.fetchCurrent());
  };

  navigateHome = _ => this.navigateToPath([]);

  render() {
    const targetItem = locate(this.state.tree, this.state.path, {});

    // If our targetItem is shallow render our lastpath until our tree has been
    // updated with the loaded path.
    const item = targetItem.shallow
      ? locate(this.state.tree, this.state.lastPath, {})
      : targetItem;

    const fileMap = item.children || {};

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
        <Listing disabled={targetItem.shallow}>{listItems}</Listing>
      </Browser>
    );
  }
}

const Browser = styled('section')`
  display: flex;
  flex-direction: column;
  max-width: 630px;
  margin: auto;
  padding: 0 15px;
`;