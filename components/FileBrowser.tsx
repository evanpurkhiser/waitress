import {useCallback, useEffect, useMemo} from 'react';
import styled from '@emotion/styled';

import FileItem from './FileItem';
import Header from './Header';
import {Divider, EmptyListing, Listing} from './Listing';
import useFileBrowser from './useFileBrowser';
import useFileFilter from './useFileFilter';
import useKeyboardNavigate from './useKeyboardNavigate';

function FileBrowser() {
  const {
    navigate,
    pathForName,
    path,
    files,
    node,
    isTransitioning,
    isLoading,
    isFirstLoad,
  } = useFileBrowser();

  const title = window.location.hostname;
  const pageTitle = path.slice(-1)[0] ?? title;

  // Update page title
  useEffect(() => void (document.title = pageTitle), [pageTitle]);

  // Support filtering via an input in the header
  const {filter, setFilter, matchedFiles, unmatchedFiles, allFiles, matchMap} =
    useFileFilter({files});

  // Handle keyboard navigation
  const {focused, setFocus} = useKeyboardNavigate({
    list: allFiles,
    onSelect: navigate.toItem,
  });

  const hasFilter = filter.length > 0;

  // Reset the filter when the file list chagnes
  useEffect(() => setFilter(''), [setFilter, files]);

  // Clear focus when the file list changes
  useEffect(() => setFocus(null), [setFocus, files]);

  // When we start typing focus the first item. When the filter becomes empty
  // clear the focus. Resets when the filtered file list changes
  useEffect(
    () => setFocus(hasFilter ? allFiles[0] ?? null : null),
    [setFocus, hasFilter, allFiles]
  );

  // momoize click handlers to avoid re-renders of File nodes
  const clickHandlers = useMemo(
    () =>
      Object.fromEntries(
        files.map(k => [k, (e: React.MouseEvent) => navigate.toItem(k, e)])
      ),
    [files, navigate]
  );

  const makeFileNode = useCallback(
    (k: string) => (
      <FileItem
        {...node.children[k]!}
        key={k}
        name={k}
        path={pathForName(k)}
        focused={k === focused}
        match={matchMap[k]}
        onClick={clickHandlers[k]}
      />
    ),
    [node, pathForName, focused, matchMap, clickHandlers]
  );

  const navigateHome = useCallback(() => navigate.toPath([]), [navigate]);

  return (
    <Browser>
      <Header
        title={title}
        onTitleClick={navigateHome}
        isLoading={node.shallow && isLoading}
      />
      <Listing disabled={isTransitioning}>
        {matchedFiles.map(makeFileNode)}
        {matchedFiles.length > 0 && <Divider />}
        {unmatchedFiles.map(makeFileNode)}
      </Listing>
      {!isFirstLoad && allFiles.length === 0 && <EmptyListing folder={pageTitle} />}
    </Browser>
  );
}

const Browser = styled('section')`
  display: flex;
  flex-direction: column;
  max-width: 630px;
  margin: auto;
  padding: 0 15px;
`;

export default FileBrowser;
