import styled from '@emotion/styled';

import LoadingSpinner from './loadingSpinner';

type Props = {
  className?: string;
  title: string;
  isLoading?: boolean;
  onClick: React.HTMLProps<HTMLHeadingElement>['onClick'];
};

const Header = styled((p: Props) => (
  <header className={p.className}>
    <h1 onClick={p.onClick}>{p.title}</h1>
    {p.isLoading && <LoadingSpinner size={16} />}
  </header>
))`
  margin: 15px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h1 {
    font-size: 1rem;
    margin: 0;
    cursor: pointer;
    flex-grow: 0;
  }
`;

export default Header;
