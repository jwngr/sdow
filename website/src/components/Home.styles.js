import ReactModal from 'react-modal';
import styled from 'styled-components';

ReactModal.setAppElement('#root');

export const Modal = styled(ReactModal)`
  position: absolute;
  top: 60px;
  right: 20px;
  width: 300px;
  padding: 12px;
  z-index: 10;
  text-align: justify;
  border: solid 3px ${(props) => props.theme.colors.darkGreen};
  background: ${(props) => props.theme.colors.creme};

  p {
    font-size: 16px;
    font-family: 'Quicksand';
    line-height: 1.5;
    margin-bottom: 12px;
  }

  p:last-of-type {
    margin-bottom: 0;
  }

  a,
  a:visited {
    color: ${(props) => props.theme.colors.darkGreen};
    transition: color 0.5s;
  }

  a:hover {
    color: ${(props) => props.theme.colors.red};
  }

  @media (max-width: 600px) {
    width: 80%;
    top: 104px;
    left: 10%;
  }
`;

export const P = styled.p`
  margin: 16px;
  font-size: 32px;
  text-align: center;
  color: ${(props) => props.theme.colors.darkGreen};

  @media (max-width: 600px) {
    margin: 12px;
    font-size: 24px;
  }
`;

export const InputFlexContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-bottom: 28px;

  @media (max-width: 1200px) {
    flex-direction: column;
  }
`;
