import styled from '@emotion/styled';

interface Props {
  size: number;
}

const LoadingSpinner = styled('div')<Props>`
  @keyframes loader {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes delayedShow {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  animation:
    loader 500ms infinite linear,
    delayedShow 500ms 200ms forwards;

  height: ${p => p.size}px;
  width: ${p => p.size}px;
  border-radius: 50%;
  border: 2px solid rgba(89, 94, 115, 0.2);
  border-left-color: #767b92;
  transform: translateZ(0);
  opacity: 0;
`;

export {LoadingSpinner};
