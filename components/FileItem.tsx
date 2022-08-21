import {memo} from 'react';
import type Fuse from 'fuse.js';
import prettyBytes from 'pretty-bytes';

import {FileName, FileSize} from './Attributes';
import FileIcon from './FileIcon';
import {ListingItem} from './Listing';
import MatchHighlight from './MatchHighlight';
import {TreeNode} from './types';

type FileProps = TreeNode & {
  path: string;
  name: string;
  focused: boolean;
  onClick: React.ComponentProps<typeof ListingItem>['onClick'];
  match?: Fuse.FuseResultMatch;
};

const FileItem = memo(({path, onClick, focused, match, isDir, name, size}: FileProps) => (
  <ListingItem {...{path, onClick, focused}}>
    <FileIcon path={path} isDir={isDir} />
    <FileName>{match ? <MatchHighlight match={match} /> : name}</FileName>
    <FileSize>{prettyBytes(size ?? 0)}</FileSize>
  </ListingItem>
));

export default FileItem;
