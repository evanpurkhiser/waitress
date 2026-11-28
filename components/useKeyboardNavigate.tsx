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

function nextFocusIndex(
  current: number,
  length: number,
  key: 'ArrowUp' | 'ArrowDown',
  jump: boolean,
) {
  if (current === -1) {
    return 0;
  }

  const last = length - 1;
  const delta = key === 'ArrowUp' ? -1 : 1;
  if (jump) {
    return delta === -1 ? 0 : last;
  }

  const next = (current + delta) % length;
  return next >= 0 ? next : last;
}

/**
 * Navigate a list of items using the up/down arrow and ^j/^k keys
 */
function useKeyboardNavigate<T>({list, onSelect, onEscape}: Props<T>) {
  const [focused, setFocus] = useState<T | null>(null);

  const setFocusIndex = useCallback(
    (index: number) => setFocus(list[index] ?? null),
    [list],
  );

  const focusedIndex = useMemo(
    () => (focused === null ? -1 : list.indexOf(focused)),
    [focused, list],
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
      if (key !== 'ArrowUp' && key !== 'ArrowDown') {
        return;
      }

      e.preventDefault();

      setFocusIndex(nextFocusIndex(focusedIndex, list.length, key, e.shiftKey));
    },
    [setFocusIndex, focusedIndex, focused, list.length, onSelect, onEscape],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleNavigate);
    return () => document.removeEventListener('keydown', handleNavigate);
  }, [handleNavigate]);

  return {focused, setFocus};
}

export {useKeyboardNavigate};
