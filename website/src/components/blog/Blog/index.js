import React from 'react';
import {Helmet} from 'react-helmet';

import {Logo} from '../../common/Logo';
import {StyledTextLink} from '../../common/StyledTextLink.tsx';
import NewsletterSignupForm from '../NewsletterSignupForm';
import posts from '../posts/index.json';
import {
  BlogPostCardWrapper,
  BlogPostDate,
  BlogPostDescription,
  Divider,
  Title,
  Wrapper,
} from './index.styles';

const BlogPostCard = ({id, date, title, description}) => (
  <BlogPostCardWrapper>
    <StyledTextLink text={title} href={`/blog/${id}`} />
    <BlogPostDate>{date}</BlogPostDate>
    <BlogPostDescription>{description}</BlogPostDescription>
  </BlogPostCardWrapper>
);

const Blog = () => (
  <React.Fragment>
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
  </React.Fragment>
);

export default Blog;
