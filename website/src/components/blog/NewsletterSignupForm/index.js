import React, { Component, useCallback, useState } from 'react';

import {Wrapper, Intro, Form, FormInput, HiddenBotInput, SubscribeButton} from './index.styles';

const NewsletterSignupForm = () => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');

  const onInputChangeHandler = useCallback((name, event) => {
    setName(event.target.value);
  }, []);

  return (
    <Wrapper>
      <Intro>
        <p>Enjoy this content?</p>
        <p>
          Subscribe to my low-volume newsletter to get notified when a new post is published or
          when I release content from one of my other projects.
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
          onChange={onEmailChangeHandler}
        />

        <FormInput
          type="text"
          name="FNAME"
          placeholder="First name"
          value={firstName}
          onChange={onFirstNameChangeHandler}
        />

        {/* From MailChimp: do not remove this or risk form bot signups */}
        <HiddenBotInput
          type="text"
          name="b_d19fa80c86cc4e9017baf4f4b_46d31d866a"
          tabIndex="-1"
          value=""
          onChange={() => {}}
        />

        <SubscribeButton>Subscribe</SubscribeButton>
      </Form>
    </Wrapper>
  );
};

export default NewsletterSignupForm;
