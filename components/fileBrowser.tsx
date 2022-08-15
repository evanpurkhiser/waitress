import {memo, useCallback, useEffect, useMemo} from 'react';
import styled from '@emotion/styled';
import prettyBytes from 'pretty-bytes';

import {FileName, FileSize} from './attributes';
import FileIcon from './fileIcon';
import Header from './header';
import {EmptyListing, Listing, ListingItem} from './listing';
import {TreeNode} from './types';
import useFileBrowser from './useFileBrowser';

type FileProps = TreeNode & {
  path: string;
  name: string;
  onClick: React.ComponentProps<typeof ListingItem>['onClick'];
};

const File = memo(({path, onClick, isDir, name, size}: FileProps) => (
  <ListingItem {...{path, onClick}}>
    <FileIcon path={path} isDir={isDir} />
    <FileName>{name}</FileName>
    <FileSize>{prettyBytes(size ?? 0)}</FileSize>
  </ListingItem>
));

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

  useEffect(() => void (document.title = pageTitle), [pageTitle]);

  const clickHandlers = useMemo(
    () =>
      Object.fromEntries(
        files.map(k => [k, (e: React.MouseEvent) => navigate.toItem(e, k)])
      ),
    [files, navigate.toItem]
  );

  const listItems = files.map(k => (
    <File
      {...node.children[k]}
      key={k}
      name={k}
      path={pathForName(k)}
      onClick={clickHandlers[k]}
    />
  ));

  const navigateHome = useCallback(() => navigate.toPath([]), [navigate.toPath]);

  return (
    <Browser>
      <Header
        title={title}
        onClick={navigateHome}
        isLoading={node.shallow && isLoading}
      />
      <Listing disabled={isTransitioning}>{listItems}</Listing>
      {!isFirstLoad && listItems.length === 0 && <EmptyListing folder={pageTitle} />}
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
