import React, {Component} from 'react';

import {Wrapper, Intro, Form, FormInput, HiddenBotInput, SubscribeButton} from './index.styles';

class NewsletterSignupForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      firstName: '',
    };

    this.onEmailChange = this.onInputChange.bind(this, 'email');
    this.onFirstNameChange = this.onInputChange.bind(this, 'firstName');
  }

  onInputChange(name, event) {
    this.setState({
      [name]: event.target.value,
    });
  }

  render() {
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
            value={this.state.email}
            onChange={this.onEmailChange}
          />

          <FormInput
            type="text"
            name="FNAME"
            placeholder="First name"
            value={this.state.firstName}
            onChange={this.onFirstNameChange}
          />

          {/* From MailChimp: do not remove this or risk form bot signups */}
          <HiddenBotInput
            type="text"
            name="b_d19fa80c86cc4e9017baf4f4b_46d31d866a"
            tabIndex="-1"
            value=""
          />

          <SubscribeButton>Subscribe</SubscribeButton>
        </Form>
      </Wrapper>
    );
  }
}

export default NewsletterSignupForm;
