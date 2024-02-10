import styled from '@emotion/styled';

// Alias file types to other icons
const FILETYPE_ALIASES: Record<string, string> = {
  sh: 'exe',
  gz: 'zip',
  tar: 'zip',
  flv: 'fla',
};

// Create svg file icon require context
// eslint-disable-next-line no-undef
const fileIcons = require.context('../icons', true, /.*\.svg/);
const fileTypes = fileIcons.keys().map(t => t.slice(2, -4));

interface Props {
  className?: string;
  isDir: boolean;
  path: string;
}

const FileIcon = styled((p: Props) => {
  let type = !p.isDir
    ? (p.path.match(/.+\.(.*)$/) || [null, ''])?.[1]?.toLowerCase() ?? ''
    : 'folder';

  type = FILETYPE_ALIASES[type] ?? type;
  type = fileTypes.includes(type) ? type : 'file';

  const {viewBox, id} = fileIcons(`./${type}.svg`);

  return (
    <svg className={p.className} viewBox={viewBox} width={16} height={16}>
      <use href={`#${id}`} xlinkHref={`#${id}`} />
    </svg>
  );
})`
  flex-shrink: 0;
  margin-right: 6px;
`;

export {FileIcon};
