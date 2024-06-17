import styled from 'styled-components';

export const TableWrapper = styled.div`
  margin: 20px auto;
  overflow: scroll;

  table {
    margin: auto;
    width: 100%;
    color: ${({theme}) => theme.colors.darkGreen};
    border: solid 3px ${({theme}) => theme.colors.darkGreen};
    border-collapse: collapse;

    th,
    td {
      font-size: 20px;
      padding: 8px 12px;
      text-align: center;
      border-right: solid 2px ${({theme}) => theme.colors.darkGreen};

      @media (max-width: 700px) {
        font-size: 16px;
      }
    }

    th {
      color: ${({theme}) => theme.colors.creme};
      background-color: ${({theme}) => theme.colors.darkGreen};
    }

    tr {
      background-color: ${({theme}) => theme.colors.gray};
    }

    tr:nth-of-type(2n) {
      background-color: ${({theme}) => theme.colors.creme};
    }

    a {
      text-decoration: none;
      color: ${({theme}) => theme.colors.darkGreen};
    }
  }
`;
