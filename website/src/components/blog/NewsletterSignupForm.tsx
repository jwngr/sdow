import React, {useState} from 'react';
import styled from 'styled-components';

import {Button} from '../common/Button.tsx';

const Wrapper = styled.div`
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

const Intro = styled.div`
  width: 90%;
  max-width: 500px;
  text-align: center;

  p:first-of-type {
    color: ${({theme}) => theme.colors.red};
    font-size: 32px;
    font-weight: bold;
    margin-bottom: 10px;

    @media (max-width: 600px) {
      font-size: 28px;
    }
  }

  p:nth-of-type(2) {
    font-size: 20px;
    color: ${({theme}) => theme.colors.darkGreen};
  }
`;

const Form = styled.form`
  width: 100%;
`;

const HiddenBotInput = styled.input`
  position: absolute;
  left: -5000px;
`;

const FormInput = styled.input`
  display: block;
  width: 100%;
  max-width: 360px;
  height: 60px;
  margin: 20px auto;
  padding: 10px;
  color: ${({theme}) => theme.colors.darkGreen};
  border: solid 3px ${({theme}) => theme.colors.darkGreen};
  background-color: ${({theme}) => theme.colors.creme};
  font-size: 24px;
  text-align: center;

  &::placeholder {
    color: ${({theme}) => theme.colors.darkGreen};
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

const SubscribeButton = styled(Button)`
  width: 200px;
  height: 60px;
  margin: auto;
  font-size: 28px;
  border-radius: 8px;
`;

export const NewsletterSignupForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');

  return (
    <Wrapper>
      <Intro>
        <p>Enjoy this content?</p>
        <p>
          Subscribe to my low-volume newsletter to get notified when a new post is published or when
          I release content from one of my other projects.
        </p>
      </Intro>

      <Form
        method="post"
        action="//jwn.us15.list-manage.com/subscribe/post?u=d19fa80c86cc4e9017baf4f4b&amp;id=46d31d866a"
        name="mc-embedded-subscribe-form"
        target="_blank"
        rel="noopener"
        noValidate
      >
        <FormInput
          type="email"
          name="EMAIL"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <FormInput
          type="text"
          name="FNAME"
          placeholder="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />

        {/* From MailChimp: do not remove this or risk form bot signups */}
        <HiddenBotInput
          type="text"
          name="b_d19fa80c86cc4e9017baf4f4b_46d31d866a"
          tabIndex={-1}
          value=""
        />

        <SubscribeButton>Subscribe</SubscribeButton>
      </Form>
    </Wrapper>
  );
};
