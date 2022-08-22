import {useCallback, useEffect} from 'react';

/**
 * Pressing cmd+c will copy the text if othing else on the
 * page is selected.
 */
function useGlobalCopy(value: string) {
  const handleKeydown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key !== 'c' || !e.metaKey) {
        return;
      }

      // Do nothing if we have text selected on the page
      const textSelection = window.getSelection()?.toString() ?? '';

      if (textSelection.length > 0) {
        return;
      }

      e.preventDefault();
      navigator.clipboard.writeText(value);
    },
    [value]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [handleKeydown]);
}

export default useGlobalCopy;
