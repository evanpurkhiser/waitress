import {useEffect, useRef, useState} from 'react';

import {TreeNode} from './types';

/**
 * Transform a path list to a URL
 */
const makeUrl = (path: string[]) => `/${path.map(encodeURIComponent).join('/')}`;

const emptyTree: TreeNode = {
  size: 0,
  isDir: false,
  isLink: false,
  children: {},
  shallow: true,
};

/**
 * Locate the path within a tree node
 */
function locate(object: TreeNode, path: string[]) {
  let index = 0;
  const {length} = path;

  while (object?.children && index < length) {
    object = object.children[path[index++]];
  }

  const result = index === length ? object : null;

  return result ?? emptyTree;
}

/**
 * Hook used to provide file listing / navigation within a file tree
 */
function useFileBrowser() {
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const [path, setPath] = useState<string[]>([]);
  const [lastPath, setLastPath] = useState<string[]>([]);

  const [tree, setTree] = useState(emptyTree);
  const [isLoading, setIsLoading] = useState(false);

  const abortController = useRef(new AbortController());

  /**
   * Loads the tree at the provided path
   */
  async function fetchTree(treePath: string[]) {
    const options = {
      signal: abortController.current.signal,
    };

    setIsLoading(true);

    try {
      const resp = await fetch(`/_tree${makeUrl(treePath)}`, options);
      const tree = await resp.json();
      setTree(tree);
    } catch {
      // Nothing to do if we're aborting
    }

    setIsLoading(false);
    setIsFirstLoad(false);
  }

  /**
   * Cancels in-flight tree requests
   */
  function cancelInFlight() {
    abortController.current.abort();
    abortController.current = new AbortController();
  }

  /**
   * Handle updates to the path
   */
  async function handlePathUpdate() {
    const newPath = decodeURIComponent(window.location.pathname)
      .split('/')
      .filter(x => x !== '');

    setPath(newPath);

    const node = locate(tree, newPath);

    // If we navigated into a fully hydrated tree, we can immedaitely update
    // the last path
    if (!node.shallow) {
      setLastPath(newPath);
    }

    cancelInFlight();
    await fetchTree(newPath);
    setLastPath(newPath);
  }

  /**
   * Navigates to a specific path
   */
  function navigateToPath(path: string[]) {
    history.pushState(null, '', makeUrl(path));
    handlePathUpdate();

    window.scrollTo(0, 0);
  }

  /**
   * Navigates to a specific folder, relative to the current path
   */
  function navigateToItem(e: React.MouseEvent, target: string) {
    const targetPath = [...path, target];
    const node = locate(tree, targetPath);

    if (!node.isDir) {
      return;
    }

    e.preventDefault();
    navigateToPath(targetPath);
  }

  useEffect(() => {
    window.addEventListener('popstate', handlePathUpdate);
    return () => window.removeEventListener('popstate', handlePathUpdate);
  }, []);

  useEffect(() => void handlePathUpdate(), []);

  // If our targetItem is shallow render our lastPath until our tree has been
  // updated with the loaded path.
  const targetItem = locate(tree, path);

  const isTransitioning = targetItem.shallow;
  const node = isTransitioning ? locate(tree, lastPath) : targetItem;

  const fileMap = node.children ?? {};

  const files = Object.keys(fileMap).sort((a, b) => {
    const c = node.children[a];
    const d = node.children[b];

    const dirSort = d.isDir ? 1 : -1;

    return c.isDir === d.isDir ? a.localeCompare(b, 'en', {numeric: true}) : dirSort;
  });

  const navigate = {
    toPath: navigateToPath,
    toItem: navigateToItem,
  };

  const props = {
    path,
    node,
    files,
    isTransitioning,
    isLoading,
    isFirstLoad,
    pathForName: (name: string) => makeUrl([...path, name]),
  };

  return {navigate, ...props};
}

export default useFileBrowser;
