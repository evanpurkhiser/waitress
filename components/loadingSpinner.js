import React from 'react';
import styled from 'react-emotion';

const LoadingSpinner = styled('div')`
  @keyframes loader {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  height: ${p => p.size}px;
  width: ${p => p.size}px;
  border-radius: 50%;
  border: 2px solid rgba(89, 94, 115, 0.2);
  border-left-color: #767b92;
  transform: translateZ(0);
  animation: loader 500ms infinite linear;
`;

export default LoadingSpinner;
