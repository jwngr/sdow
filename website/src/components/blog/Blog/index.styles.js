import styled from 'styled-components';

export const Wrapper = styled.div`
  max-width: 740px;
  padding: 4px 20px;
  margin: 20px auto;
  background-color: ${(props) => props.theme.colors.creme};
  border: solid 3px ${(props) => props.theme.colors.darkGreen};

  @media (max-width: 600px) {
    padding: 2px 16px;
    margin-bottom: 0;
    border: none;
    border-top: solid 3px ${(props) => props.theme.colors.darkGreen};
  }
`;

export const Title = styled.h1`
  margin: 20px auto;
  text-align: center;
  font-size: 32px;
  font-weight: bold;
  color: ${(props) => props.theme.colors.darkGreen};

  @media (max-width: 600px) {
    font-size: 28px;
  }
`;

export const Divider = styled.div`
  border-top: solid 1px ${(props) => props.theme.colors.darkGreen};
  margin: 20px auto;

  &::after {
    content: '';
  }
`;

export const BlogPostCardWrapper = styled.div`
  a {
    font-size: 28px;

    @media (max-width: 600px) {
      font-size: 24px;
    }
  }
`;

export const BlogPostDate = styled.p`
  font-size: 16px;
  margin: 12px 0;
  color: ${(props) => props.theme.colors.darkGreen};
`;

export const BlogPostDescription = styled.p`
  font-size: 20px;
  line-height: 1.5;
  color: ${(props) => props.theme.colors.darkGreen};
`;
