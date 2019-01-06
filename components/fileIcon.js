import React from 'react';
import styled from '@emotion/styled';

// Alias file types to other icons
const FILETYPE_ALIASES = {
  sh: 'exe',
  gz: 'zip',
  tar: 'zip',
  flv: 'fla',
};

// Create svg file icon require context
const fileIcons = require.context('../icons', true, /.*\.svg/);
const fileTypes = fileIcons.keys().map(t => t.slice(2, -4));

const FileIcon = styled(p => {
  let type = !p.isDir
    ? (p.path.match(/.+\.(.*)$/) || [, ''])[1].toLowerCase()
    : 'folder';

  type = FILETYPE_ALIASES[type] || type;
  type = fileTypes.includes(type) ? type : 'file';

  const { viewBox, id } = fileIcons(`./${type}.svg`);

  return (
    <svg className={p.className} viewBox={viewBox} width={16} height={16}>
      <use href={`#${id}`} xlinkHref={`#${id}`} />
    </svg>
  );
})`
  flex-shrink: 0;
  margin-right: 6px;
`;

export default FileIcon;
