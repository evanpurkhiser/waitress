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

export const Listing = styled('ul')<ListingProps>`
  margin: 10px 0;
  padding: 0 2px;
  list-style: none;
  font-size: 12px;
  ${getDisabled};
`;

export const Divider = styled('hr')`
  border: none;
  margin: 10px 0;
`;

interface EmptyProps {
  className?: string;
  folder?: string;
}

export const EmptyListing = styled((p: EmptyProps) => (
  <div className={p.className}>Nothing in {p.folder}</div>
))`
  flex-grow: 1;
  display: flex;
  height: 120px;
  align-items: center;
  justify-content: center;
  color: #bbb;
  border-radius: 12px;
  border: 2px dashed #eee;
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

export const ListingItem = styled((p: ItemProps) => (
  <li className={p.className} ref={p.focused ? scrollToFocus : undefined}>
    <a href={p.path} onClick={p.onClick}>
      {p.children}
    </a>
  </li>
))`
  margin: 0 -10px;
  border-radius: 3px;
  cursor: pointer;

  ${p => p.focused && 'background: #fafafa'};
  scroll-padding: 20px;

  &:hover {
    background: #fafafa;
  }

  a {
    padding: 8px 10px;
    line-height: 1rem;
    display: flex;
    flex-direction: row;
    text-decoration: none;
    color: #595e73;
  }
`;
