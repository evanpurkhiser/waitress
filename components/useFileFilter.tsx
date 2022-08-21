import {useMemo, useState} from 'react';
import Fuse from 'fuse.js';

type Props = {
  /**
   * The list of files to filter
   */
  files: string[];
};

const FUSE_OPTIONS: Fuse.IFuseOptions<string> = {
  useExtendedSearch: true,
  includeMatches: true,
  minMatchCharLength: 2,
  threshold: 0.4,
};

function useFileFilter({files}: Props) {
  const [filter, setFilter] = useState('');

  const fuse = useMemo(() => new Fuse(files, FUSE_OPTIONS), [files]);

  // Perform a search when the filter changes
  const filterResult = useMemo(() => fuse.search(filter), [fuse, filter]);

  const matchedFiles = useMemo(
    () => filterResult?.map(r => r.item) ?? [],
    [filterResult]
  );

  const unmatchedFiles = useMemo(
    () => files.filter(f => !matchedFiles.includes(f)),
    [files, matchedFiles]
  );

  const allFiles = useMemo(
    () => [...matchedFiles, ...unmatchedFiles],
    [matchedFiles, unmatchedFiles]
  );

  const matchMap = useMemo(
    () => Object.fromEntries(filterResult?.map(r => [r.item, r.matches?.[0]]) ?? []),
    [filterResult]
  ) as Record<string, Fuse.FuseResultMatch | undefined>;

  return {setFilter, matchedFiles, unmatchedFiles, allFiles, matchMap};
}

export default useFileFilter;
