import React from 'react';
import styled from 'styled-components';

import {Logo} from '../common/Logo';
import {StyledTextLink} from '../common/StyledTextLink';
import {NewsletterSignupForm} from './NewsletterSignupForm';
import {BLOG_POSTS} from './posts/data';

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

const BlogPostCard: React.FC<{
  readonly id: string;
  readonly date: string;
  readonly title: string;
  readonly description: string;
}> = ({id, date, title, description}) => (
  <BlogPostCardWrapper>
    <StyledTextLink text={title} href={`/blog/${id}`} />
    <BlogPostDate>{date}</BlogPostDate>
    <BlogPostDescription>{description}</BlogPostDescription>
  </BlogPostCardWrapper>
);

export const Blog: React.FC = () => (
  <>
    <title>Blog | Six Degrees of Wikipedia</title>

    <Logo />

    <Wrapper>
      <Title>A blog about building, maintaining, and promoting Six Degrees of Wikipedia</Title>

      <Divider />
      {BLOG_POSTS.map((postInfo) => (
        <React.Fragment key={postInfo.id}>
          <BlogPostCard
            id={postInfo.id}
            date={postInfo.date}
            title={postInfo.title}
            description={postInfo.description}
          />
          <Divider />
        </React.Fragment>
      ))}

      <NewsletterSignupForm />
    </Wrapper>
  </>
);
