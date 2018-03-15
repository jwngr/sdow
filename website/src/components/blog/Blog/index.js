import React from 'react';
import {Helmet} from 'react-helmet';

import Logo from '../../common/Logo';
import StyledLink from '../../common/StyledLink';
import NewsletterSignupForm from '../NewsletterSignupForm';

import {
  Title,
  Wrapper,
  Divider,
  BlogPostCardWrapper,
  BlogPostDate,
  BlogPostDescription,
} from './index.styles';

import posts from '../posts/index.json';

const BlogPostCard = ({id, date, title, description}) => (
  <BlogPostCardWrapper>
    <StyledLink href={`/blog/${id}`}>{title}</StyledLink>
    <BlogPostDate>{date}</BlogPostDate>
    <BlogPostDescription>{description}</BlogPostDescription>
  </BlogPostCardWrapper>
);

export default () => (
  <React.Fragment>
    <Helmet>
      <title>Blog | Six Degrees of Wikipedia</title>
    </Helmet>

    <Logo />

    <Wrapper>
      <Title>A blog about building, maintaining, and promoting Six Degrees of Wikipedia</Title>

      <Divider />
      {posts.map((postInfo) => (
        <React.Fragment>
          <BlogPostCard {...postInfo} />
          <Divider />
        </React.Fragment>
      ))}

      <NewsletterSignupForm />
    </Wrapper>
  </React.Fragment>
);
