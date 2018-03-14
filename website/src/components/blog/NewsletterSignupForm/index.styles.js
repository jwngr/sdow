import styled from 'styled-components';
import Button from '../../common/Button';

export const Wrapper = styled.div`
  display: flex;
  margin: 20px auto;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  /* Fix weird input button styling on iOS */
  input {
    appearance: none;
  }
`;

export const Intro = styled.div`
  width: 90%;
  max-width: 500px;
  text-align: center;

  p:first-of-type {
    color: ${(props) => props.theme.colors.red};
    font-size: 32px;
    font-weight: bold;
    margin-bottom: 10px;

    @media (max-width: 600px) {
      font-size: 28px;
    }
  }

  p:nth-of-type(2) {
    font-size: 20px;
    color: ${(props) => props.theme.colors.darkGreen};
  }
`;

export const Form = styled.form`
  width: 100%;
`;

export const HiddenBotInput = styled.input`
  position: absolute;
  left: -5000px;
`;

export const FormInput = styled.input`
  display: block;
  width: 100%;
  max-width: 360px;
  height: 60px;
  margin: 20px auto;
  padding: 10px;
  color: ${(props) => props.theme.colors.darkGreen};
  border: solid 3px ${(props) => props.theme.colors.darkGreen};
  background-color: ${(props) => props.theme.colors.creme};
  font-size: 24px;
  text-align: center;

  &::placeholder {
    color: ${(props) => props.theme.colors.darkGreen};
    opacity: 0.5;
    transition: opacity 0.35s ease-in-out;
  }

  &:hover::placeholder {
    opacity: 0.75;
  }

  &:focus::placeholder {
    opacity: 0;
  }
`;

export const SubscribeButton = Button.extend`
  width: 200px;
  height: 60px;
  margin: auto;
  font-size: 28px;
  border-radius: 8px;
`;
