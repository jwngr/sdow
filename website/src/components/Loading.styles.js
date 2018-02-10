import styled from 'styled-components';

export const Wrapper = styled.div`
  width: 800px;
  margin: auto;
  text-align: center;
`;

export const LoadingIndicator = styled.div`
  margin: 40px auto;
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
    background-color: ${(props) => props.theme.colors.darkGreen};
    animation: sk-foldCubeAngle 2.4s infinite linear both;
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
    animation-delay: 0.3s;
  }

  div:nth-of-type(3):before {
    animation-delay: 0.9s;
  }

  div:nth-of-type(4):before {
    animation-delay: 0.6s;
  }

  @-webkit-keyframes sk-foldCubeAngle {
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

  @keyframes sk-foldCubeAngle {
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
`;

export const Fact = styled.p`
  font-size: 20px;
  line-height: 1.5;
`;
