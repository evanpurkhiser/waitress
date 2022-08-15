import Fuse from 'fuse.js';
import {useEffect, useMemo, useRef, useState} from 'react';

type Props = {
  /**
   * The list of files to filter
   */
  files: string[];
};

function useFileFilter({files}: Props) {
  const [filter, setFilter] = useState('');

  const fuse = useRef<Fuse<string>>();

  if (fuse.current === undefined) {
    fuse.current = new Fuse([], {useExtendedSearch: true, includeMatches: true});
  }

  // Update the fuse collection when the file list changes
  useEffect(() => fuse.current?.setCollection(files), [files]);

  // Perform a search when the filter changes
  const filterResult = useMemo(() => fuse.current?.search(filter), [filter]);

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

  console.log(matchMap);

  return {setFilter, matchedFiles, unmatchedFiles, allFiles, matchMap};
}

export default useFileFilter;
