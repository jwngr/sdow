import React from 'react';
import {Helmet} from 'react-helmet';
import styled from 'styled-components';

import {Logo} from '../common/Logo.tsx';
import {StyledTextLink} from '../common/StyledTextLink.tsx';
import {NewsletterSignupForm} from './NewsletterSignupForm.tsx';
import posts from './posts/index.json';

const Wrapper = styled.div`
  max-width: 740px;
  padding: 4px 20px;
  margin: 20px auto;
  background-color: ${({theme}) => theme.colors.creme};
  border: solid 3px ${({theme}) => theme.colors.darkGreen};

  @media (max-width: 600px) {
    padding: 2px 16px;
    margin-bottom: 0;
    border: none;
    border-top: solid 3px ${({theme}) => theme.colors.darkGreen};
  }
`;

const Title = styled.h1`
  margin: 20px auto;
  text-align: center;
  font-size: 32px;
  font-weight: bold;
  color: ${({theme}) => theme.colors.darkGreen};

  @media (max-width: 600px) {
    font-size: 28px;
  }
`;

const Divider = styled.div`
  border-top: solid 1px ${({theme}) => theme.colors.darkGreen};
  margin: 20px auto;

  &::after {
    content: '';
  }
`;

const BlogPostCardWrapper = styled.div`
  a {
    font-size: 28px;

    @media (max-width: 600px) {
      font-size: 24px;
    }
  }
`;

const BlogPostDate = styled.p`
  font-size: 16px;
  margin: 12px 0;
  color: ${({theme}) => theme.colors.darkGreen};
`;

const BlogPostDescription = styled.p`
  font-size: 20px;
  line-height: 1.5;
  color: ${({theme}) => theme.colors.darkGreen};
`;

const BlogPostCard = ({id, date, title, description}) => (
  <BlogPostCardWrapper>
    <StyledTextLink text={title} href={`/blog/${id}`} />
    <BlogPostDate>{date}</BlogPostDate>
    <BlogPostDescription>{description}</BlogPostDescription>
  </BlogPostCardWrapper>
);

export const Blog = () => (
  <>
    <Helmet>
      <title>Blog | Six Degrees of Wikipedia</title>
    </Helmet>

    <Logo />

    <Wrapper>
      <Title>A blog about building, maintaining, and promoting Six Degrees of Wikipedia</Title>

      <Divider />
      {posts.map((postInfo) => (
        <React.Fragment key={postInfo.id}>
          <BlogPostCard {...postInfo} />
          <Divider />
        </React.Fragment>
      ))}

      <NewsletterSignupForm />
    </Wrapper>
  </>
);
