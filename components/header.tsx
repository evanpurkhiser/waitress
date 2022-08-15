import styled from '@emotion/styled';

import Filter from './filter';
import LoadingSpinner from './loadingSpinner';

type Props = {
  className?: string;
  title: string;
  isLoading?: boolean;
  onTitleClick: React.HTMLProps<HTMLHeadingElement>['onClick'];
  onFilterChange: (search: string) => void;
};

const Header = styled((p: Props) => (
  <header className={p.className}>
    <h1 onClick={p.onTitleClick}>{p.title}</h1>
    <Filter onChange={p.onFilterChange} />
    {p.isLoading && <LoadingSpinner size={16} />}
  </header>
))`
  margin: 15px 0;
  display: grid;
  grid-template-columns: max-content 1fr max-content;
  gap: 12px;
  align-items: center;

  h1 {
    font-size: 1rem;
    margin: 0;
    cursor: pointer;
    flex-grow: 0;
  }
`;

export default Header;
