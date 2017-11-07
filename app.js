import './app.scss'

import classNames  from 'classNames';
import prettyBytes from 'pretty-bytes';
import Fuse        from 'fuse.js';
import ReactDom    from 'react-dom';
import React, { Component } from 'react';

/**
 * flattenTree flattens a file tree object down into a list of file paths. Used
 * for generating the data for fuse.
 */
function flattenTree(fileTree, path = []) {
  let items = [];

  for (const key in fileTree) {
    const item = fileTree[key];
    const itemPath = [ ...path, key ];

    if (!item.isDir && !item.isLink) {
      items.push(itemPath.join('/'));
    } else {
      items = [ ...items, ...flattenTree(item.children, itemPath) ];
    }
  }

  return items;
}

function locatePathItem(tree, path) {
  let item = { children: tree, isDir: true };

  for (const key of path) {
    item = item.children[key]

    if (item === undefined) {
      return null;
    }
  }

  return item
}

function ext(path) {
  const match = path.match(/.+\.(.*)$/);

  return match ? match[1].toLowerCase() : '';
}

/**
 * Transform a path list to a URL
 */
const makeUrl = path => '/' + path.map(encodeURIComponent).join('/');

const LineItem = p => <li
  className={classNames({ folder: p.isDir }, ext(p.path))}>
  <a href={p.path} data-name={p.name} onClick={p.onClick}>
    <div className="name">{p.name}</div>
    <div className="size">{prettyBytes(p.size)}</div>
  </a>
</li>;

const getWindowPath = _ => decodeURIComponent(window.location.pathname)
  .split('/')
  .filter(x => x);

class FileBrowser extends Component {
  constructor() {
    super()
    this.state = { path: getWindowPath(), tree: {} };

    this.updatePath = this.updatePath.bind(this);
    this.navigateFromItem = this.navigateFromItem.bind(this);
  }

  componentDidMount() {
    window.addEventListener('popstate', this.updatePath);

    fetch('/index.json')
      .then(r => r.json())
      .then(j => this.setState({ tree: j }));
  }

  navigateToPath(path) {
    history.pushState(null, null, makeUrl(path));
    window.scrollTo(0, 0);
    this.setState({ path })
  }

  navigateFromItem(e) {
    const key  = e.target.closest('a').dataset.name;
    const path = [ ...this.state.path, key ];
    const item = locatePathItem(this.state.tree, path) || {};

    if (!item.isDir) {
      return;
    }

    e.preventDefault();
    this.navigateToPath(path);
  }

  updatePath() {
    this.setState({ path: getWindowPath() });
  }

  render() {
    const item = locatePathItem(this.state.tree, this.state.path);
    const fileMap = item === null ? {} : item.children;

    const files = Object.keys(fileMap).sort((a, b) => {
      const c = item.children[a];
      const d = item.children[b];

      return c.isDir == d.isDir ? 0 : c.isDir ? -1 : 1;
    });

    const listItems = files.map(k => <LineItem key={k}
      { ...item.children[k] }
      name={k}
      path={makeUrl([ ...this.state.path, k ])}
      onClick={this.navigateFromItem} />)

    return <div className="browser">
      <header>
        <h1 onClick={_ => this.navigateToPath([])}>public.evanpurkhiser</h1>
      </header>
      <input placeholder="Search for files..." />
      <ul className="listing">
        {listItems}
      </ul>
    </div>;
  }
}

ReactDom.render(<FileBrowser />, document.getElementById('container'))
