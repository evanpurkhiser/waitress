import styled from '@emotion/styled';

const FileName = styled('div')`
  flex-grow: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

const FileSize = styled('div')`
  flex-shrink: 0;
  margin-left: 5px;
  font-size: 0.6rem;
  color: #888;
`;

export { FileName, FileSize };
