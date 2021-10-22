import {useEffect} from 'react';
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

const File = ({path, onClick, isDir, name, size}: FileProps) => (
  <ListingItem path={path} onClick={onClick}>
    <FileIcon path={path} isDir={isDir} />
    <FileName>{name}</FileName>
    <FileSize>{prettyBytes(size ?? 0)}</FileSize>
  </ListingItem>
);

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

  const listItems = files.map(k => (
    <File
      {...node.children[k]}
      key={k}
      name={k}
      path={pathForName(k)}
      onClick={e => navigate.toItem(e, k)}
    />
  ));

  return (
    <Browser>
      <Header
        title={title}
        onClick={() => navigate.toPath([])}
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
