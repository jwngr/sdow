import styled from 'styled-components';

export const Wrapper = styled.div`
  width: 700px;
  margin: 60px auto 40px auto;
  text-align: center;

  @media (max-width: 1200px) {
    width: 70%;
    margin-top: 40px;
  }
`;

export const Fact = styled.div`
  font-size: 20px;
  line-height: 1.5;

  @media (max-width: 1200px) {
    font-size: 16px;
  }
`;

export const LoadingIndicator = styled.div`
  margin: 0 auto 40px auto;
  width: 60px;
  height: 60px;
  position: relative;
  transform: rotateZ(45deg);

  div {
    float: left;
    width: 50%;
    height: 50%;
    position: relative;
    transform: scale(1.1);
  }

  div:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: ${(props) => props.theme.colors.yellow};
    animation: fold 3.5s infinite linear both;
    transform-origin: 100% 100%;
  }

  div:nth-of-type(2) {
    transform: scale(1.1) rotateZ(90deg);
  }

  div:nth-of-type(3) {
    transform: scale(1.1) rotateZ(270deg);
  }

  div:nth-of-type(4) {
    transform: scale(1.1) rotateZ(180deg);
  }

  div:nth-of-type(2):before {
    animation-delay: 0.5s;
  }

  div:nth-of-type(3):before {
    animation-delay: 1.5s;
  }

  div:nth-of-type(4):before {
    animation-delay: 1s;
  }

  @keyframes fold {
    0%,
    10% {
      transform: perspective(140px) rotateX(-180deg);
      opacity: 0;
    }
    25%,
    75% {
      transform: perspective(140px) rotateX(0deg);
      opacity: 1;
    }
    90%,
    100% {
      transform: perspective(140px) rotateY(180deg);
      opacity: 0;
    }
  }

  @media (max-width: 1200px) {
    width: 52px;
    height: 52px;
  }
`;
