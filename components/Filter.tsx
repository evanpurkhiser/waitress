import {useCallback, useEffect, useRef} from 'react';
import styled from '@emotion/styled';

import {useFilter} from './useStore';

/**
 * This is used to decide if a pressed key will focus the filter input. For
 * example, we probably don't want / to focus the filter input.
 */
const KEY_REGEX = /^[a-zA-Z0-9.!@#$%^&*())\-=]$/;

function Filter() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [filter, setFilter] = useFilter();

  const focusOnGlobalInput = useCallback(
    (e: KeyboardEvent) => {
      if (inputRef.current === null) {
        return;
      }

      // Escape clears the input
      if (e.key === 'Escape') {
        inputRef.current.value = '';
        inputRef.current.blur();
        setFilter('');
        return;
      }

      // Nothing else to do if we already have focus on the input
      if (e.target === inputRef.current) {
        return;
      }

      // handle cmd+a to select everything in the filter input
      if (e.key === 'a' && e.metaKey) {
        e.preventDefault();

        inputRef.current.setSelectionRange(0, inputRef.current.value.length);
        inputRef.current.focus();
        return;
      }

      // Backspace triggers focus
      if (e.key === 'Backspace') {
        inputRef.current.focus();
        return;
      }

      // Ignore anything that doesn't look like it could be part of a filename
      if (e.key.match(KEY_REGEX) === null) {
        return;
      }

      // Ignore with modifiers
      if (e.altKey || e.metaKey || e.ctrlKey) {
        return;
      }

      inputRef.current.focus();
    },
    [setFilter]
  );

  useEffect(() => {
    document.addEventListener('keydown', focusOnGlobalInput);
    return () => document.removeEventListener('keydown', focusOnGlobalInput);
  });

  return (
    <SearchInput
      onChange={e => setFilter(e.target.value)}
      value={filter}
      ref={inputRef}
    />
  );
}

export default Filter;

const SearchInput = styled('input')`
  padding: 4px 0;
  margin: -4px 0;
  border: none;
  outline: none;
  font-family: Ubuntu, sans-serif;
  font-size: 1rem;
  color: #97979c;
  caret-color: #97979c;
  cursor: default;
  pointer-events: none;

  &:placeholder-shown {
    opacity: 0;
  }
`;
