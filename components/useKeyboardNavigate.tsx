import {useCallback, useEffect, useMemo, useState} from 'react';

interface Props<T> {
  /**
   * The list of values to navigate through
   */
  list: T[];
  /**
   * Callback triggered when the item is selected
   */
  onSelect: (item: T, e: KeyboardEvent) => void;
  /**
   * Callback triggered when escape is pressed
   */
  onEscape: (e: KeyboardEvent) => void;
}

/**
 * Navigate a list of items using the up/down arrow and ^j/^k keys
 */
function useKeyboardNavigate<T>({list, onSelect, onEscape}: Props<T>) {
  const [focused, setFocus] = useState<T | null>(null);

  const setFocusIndex = useCallback(
    (index: number) => setFocus(list[index] ?? null),
    [list]
  );

  const focusedIndex = useMemo(
    () => (focused === null ? -1 : list.indexOf(focused)),
    [focused, list]
  );

  const handleNavigate = useCallback(
    (e: KeyboardEvent) => {
      // Handle keyboard selection
      if (e.key === 'Enter' && focused !== null) {
        onSelect(focused, e);
        return;
      }

      // Escape clears the keyboard selection
      if (e.key === 'Escape') {
        setFocus(null);
        onEscape(e);
        return;
      }

      // Translate readline + vim style bindings
      const key =
        e.ctrlKey && e.key === 'j'
          ? 'ArrowDown'
          : e.ctrlKey && e.key === 'k'
          ? 'ArrowUp'
          : e.ctrlKey && e.key === 'n'
          ? 'ArrowDown'
          : e.ctrlKey && e.key === 'p'
          ? 'ArrowUp'
          : e.key;

      // Does nothing for everything except arrow keys
      if (!['ArrowUp', 'ArrowDown'].includes(key)) {
        return;
      }

      e.preventDefault();

      // Nothing focused? Start from the first item
      if (focusedIndex === -1) {
        setFocusIndex(0);
        return;
      }

      const endIndex = list.length - 1;
      const indexDelta = key === 'ArrowUp' ? -1 : 1;

      // Holding shift moves to the start or end
      if (e.shiftKey) {
        setFocusIndex(indexDelta === -1 ? 0 : endIndex);
        return;
      }

      // Compute wraparound
      const newIndex = (focusedIndex + indexDelta) % list.length;

      // Reverse wraparound to the end
      setFocusIndex(newIndex >= 0 ? newIndex : endIndex);
    },
    [setFocusIndex, focusedIndex, focused, list.length, onSelect, onEscape]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleNavigate);
    return () => document.removeEventListener('keydown', handleNavigate);
  }, [handleNavigate]);

  return {focused, setFocus};
}

export default useKeyboardNavigate;
