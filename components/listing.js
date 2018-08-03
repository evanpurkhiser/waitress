import React from 'react';
import styled, { css } from 'react-emotion';

const getDisabled = p =>
  p.disabled &&
  css`
    filter: grayscale(1);
    opacity: 0.5;
    pointer-events: none;
    user-select: none;
  `;

const Listing = styled('ul')`
  margin: 10px 0;
  padding: 0 2px;
  list-style: none;
  font-size: 12px;
  ${getDisabled};
`;

const ListingItem = styled(p => (
  <li className={p.className}>
    <a href={p.path} onClick={p.onClick}>
      {p.children}
    </a>
  </li>
))`
  margin: 0 -10px;
  border-radius: 3px;
  cursor: pointer;

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
export { Listing, ListingItem };
