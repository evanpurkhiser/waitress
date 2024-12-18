import {useMemo} from 'react';
import Fuse, {FuseResultMatch, IFuseOptions} from 'fuse.js';

import {useFilter} from './useStore';

interface Props {
  /**
   * The list of files to filter
   */
  files: string[];
}

const FUSE_OPTIONS: IFuseOptions<string> = {
  useExtendedSearch: true,
  includeMatches: true,
  minMatchCharLength: 2,
  threshold: 0.4,
};

function useFileFilter({files}: Props) {
  const [filter, setFilter] = useFilter();

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
  ) as Record<string, FuseResultMatch | undefined>;

  return {setFilter, matchedFiles, unmatchedFiles, allFiles, matchMap};
}

export {useFileFilter};
