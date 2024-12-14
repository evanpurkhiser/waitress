import {css} from '@emotion/react';
import styled from '@emotion/styled';

interface ListingProps {
  disabled?: boolean;
}

const getDisabled = (p: ListingProps) =>
  p.disabled &&
  css`
    filter: grayscale(1);
    opacity: 0.5;
    pointer-events: none;
    user-select: none;
  `;

const Listing = styled('ul')<ListingProps>`
  margin: 10px 0;
  padding: 0 2px;
  list-style: none;
  font-size: 12px;
  ${getDisabled};
`;

const Divider = styled('hr')`
  border: none;
  margin: 10px 0;
`;

interface EmptyProps {
  className?: string;
  folder?: string;
}

const EmptyListing = styled((p: EmptyProps) => (
  <div className={p.className}>Nothing in {p.folder}</div>
))`
  flex-grow: 1;
  display: flex;
  height: 120px;
  align-items: center;
  justify-content: center;
  color: var(--textEmpty);
  border-radius: 12px;
  border: 2px dashed var(--borderEmpty);
  margin: -10px 0 10px;
`;

interface ItemProps {
  className?: string;
  path?: string;
  focused?: boolean;
  onClick?: React.HTMLProps<HTMLAnchorElement>['onClick'];
  children?: React.ReactNode;
}

function scrollToFocus(el: HTMLLIElement | null) {
  el?.scrollIntoView({block: 'center'});
}

const ListingItem = styled((p: ItemProps) => (
  <li className={p.className} ref={p.focused ? scrollToFocus : undefined}>
    <a href={p.path} onClick={p.onClick}>
      {p.children}
    </a>
  </li>
))`
  margin: 0 -10px;
  border-radius: 3px;
  cursor: pointer;

  ${p => p.focused && 'background: var(--focusBackground)'};
  scroll-padding: 20px;

  &:hover {
    background: var(--focusBackground);
  }

  a {
    padding: 8px 10px;
    line-height: 1rem;
    display: flex;
    flex-direction: row;
    text-decoration: none;
    color: var(--text);
  }
`;

export {Divider, EmptyListing, Listing, ListingItem};
