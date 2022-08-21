import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

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
  let foundObject: TreeNode | undefined = object;

  while (foundObject?.children && index < path.length) {
    foundObject = foundObject?.children[path[index++]!];
  }

  const result = index === path.length ? foundObject : null;

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
  const fetchTree = useCallback(async (treePath: string[]) => {
    const options = {
      signal: abortController.current.signal,
    };

    setIsLoading(true);

    try {
      const resp = await fetch(`/_tree${makeUrl(treePath)}`, options);
      setTree(await resp.json());
    } catch {
      // Nothing to do if we're aborting
    }

    setIsLoading(false);
    setIsFirstLoad(false);
  }, []);

  /**
   * Cancels in-flight tree requests
   */
  const cancelInFlight = useCallback(() => {
    abortController.current.abort();
    abortController.current = new AbortController();
  }, []);

  /**
   * Handle updates to the path
   */
  const handlePathUpdate = useCallback(async () => {
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
  }, [tree, fetchTree, cancelInFlight]);

  /**
   * Navigates to a specific path
   */
  const navigateToPath = useCallback(
    (targetPath: string[], e?: Event | React.UIEvent) => {
      const node = locate(tree, targetPath);
      const url = makeUrl(targetPath);

      // Clicks fallthrough to browser behavior
      if (!node.isDir && e?.type === 'click') {
        return;
      }

      e?.preventDefault();

      // Other event triggers URL assignment for files
      if (!node.isDir) {
        location.assign(url);
        return;
      }

      // Everything else is updates history state
      history.pushState(null, '', url);
      handlePathUpdate();

      window.scrollTo(0, 0);
    },
    [handlePathUpdate, tree]
  );

  /**
   * Navigates to a specific folder, relative to the current path
   */
  const navigateToItem = useCallback(
    (target: string, e?: Event | React.UIEvent) => navigateToPath([...path, target], e),
    [navigateToPath, path]
  );

  /**
   * Navigate up a directory
   */
  const navigateToParent = useCallback(
    (e?: Event | React.UIEvent) => navigateToPath(path.slice(0, -1), e),
    [navigateToPath, path]
  );

  useEffect(() => {
    window.addEventListener('popstate', handlePathUpdate);
    return () => window.removeEventListener('popstate', handlePathUpdate);
  }, [handlePathUpdate]);

  useEffect(() => void handlePathUpdate(), []);

  // If our targetItem is shallow render our lastPath until our tree has been
  // updated with the loaded path.
  const targetItem = useMemo(() => locate(tree, path), [tree, path]);

  const isTransitioning = targetItem.shallow;

  const node = useMemo(
    () => (isTransitioning ? locate(tree, lastPath) : targetItem),
    [tree, lastPath, isTransitioning, targetItem]
  );

  const files = useMemo(
    () =>
      Object.keys(node.children ?? {}).sort((a, b) => {
        const c = node.children[a]!;
        const d = node.children[b]!;

        const dirSort = d.isDir ? 1 : -1;

        return c.isDir === d.isDir ? a.localeCompare(b, 'en', {numeric: true}) : dirSort;
      }),
    [node.children]
  );

  const pathForName = useCallback((name: string) => makeUrl([...path, name]), [path]);

  const navigate = useMemo(
    () => ({
      toPath: navigateToPath,
      toItem: navigateToItem,
      toParent: navigateToParent,
    }),
    [navigateToPath, navigateToItem, navigateToParent]
  );

  return {
    path,
    node,
    files,
    isTransitioning,
    isLoading,
    isFirstLoad,
    pathForName,
    navigate,
  };
}

export default useFileBrowser;
