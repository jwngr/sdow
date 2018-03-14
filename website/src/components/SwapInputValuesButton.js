import React from 'react';
import styled from 'styled-components';

const P = styled.p`
  margin: 16px;
  font-size: 32px;
  text-align: center;
  color: ${(props) => props.theme.colors.darkGreen};

  @media (max-width: 600px) {
    margin: 12px;
    font-size: 24px;
  }
`;

const SwapButton = styled.svg`
  width: 52px;
  margin: 0 5px;
  cursor: pointer;
  fill: ${(props) => props.theme.colors.darkGreen};
  stroke: ${(props) => props.theme.colors.darkGreen};
  transition: fill 0.5s, stroke 0.5s, transform 0.5s;

  &:hover {
    opacity: 1;
    fill: ${(props) => props.theme.colors.red};
    stroke: ${(props) => props.theme.colors.red};
  }

  @media (max-width: 1200px) {
    transform: rotate(90deg);
  }
`;

export default ({sourcePageTitle, targetPageTitle, swapPageTitles}) => {
  if (sourcePageTitle === '' || targetPageTitle === '') {
    return <P>to</P>;
  } else {
    return (
      <SwapButton
        viewBox="0 0 100 100"
        onClick={() => swapPageTitles(targetPageTitle, sourcePageTitle)}
      >
        <path d="m76.654 33.16c-0.023-0.116-0.064-0.225-0.102-0.335-0.021-0.059-0.031-0.121-0.056-0.179-0.052-0.122-0.118-0.235-0.187-0.349-0.023-0.04-0.041-0.084-0.066-0.123-0.101-0.149-0.215-0.289-0.342-0.416l-12.49-12.49c-1.074-1.074-2.814-1.074-3.889 0-1.074 1.073-1.074 2.814 0 3.889l7.797 7.798h-40.694c-1.519 0-2.75 1.231-2.75 2.75s1.231 2.75 2.75 2.75h40.694l-7.799 7.799c-1.074 1.073-1.074 2.814 0 3.889 0.537 0.537 1.24 0.806 1.944 0.806s1.407-0.269 1.944-0.806l12.493-12.492c0.127-0.127 0.241-0.267 0.342-0.416 0.025-0.039 0.043-0.083 0.066-0.123 0.068-0.113 0.135-0.227 0.187-0.349 0.024-0.058 0.035-0.12 0.056-0.179 0.037-0.11 0.078-0.219 0.102-0.335 0.035-0.178 0.055-0.359 0.055-0.544s-0.02-0.367-0.055-0.545zm-3.279 30.386h-40.694l7.799-7.799c1.074-1.073 1.074-2.814 0-3.889s-2.814-1.074-3.889 0l-12.493 12.493c-0.127 0.127-0.241 0.267-0.342 0.416-0.024 0.038-0.041 0.08-0.063 0.118-0.069 0.114-0.138 0.229-0.189 0.354-0.023 0.057-0.034 0.118-0.055 0.176-0.037 0.111-0.079 0.221-0.103 0.338-0.036 0.178-0.055 0.359-0.055 0.544s0.019 0.366 0.055 0.544c0.023 0.117 0.065 0.227 0.103 0.338 0.021 0.058 0.031 0.119 0.055 0.176 0.052 0.124 0.12 0.239 0.189 0.354 0.022 0.038 0.039 0.08 0.063 0.118 0.101 0.149 0.215 0.289 0.342 0.416l12.491 12.491c0.537 0.537 1.24 0.806 1.944 0.806s1.407-0.269 1.944-0.806c1.074-1.073 1.074-2.814 0-3.889l-7.797-7.798h40.694c1.519 0 2.75-1.231 2.75-2.75s-1.23-2.751-2.749-2.751z" />
      </SwapButton>
    );
  }
};
