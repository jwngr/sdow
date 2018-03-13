import React from 'react';

import {TableWrapper} from './index.styles';

export default ({headers, rows}) => {
  const headerRow = (
    <tr>
      {headers.map((header) => {
        if (typeof header === 'string') {
          return <th>{header}</th>;
        } else {
          return <th width={header.width}>{header.text}</th>;
        }
      })}
    </tr>
  );

  const dataRows = rows.map((row) => {
    return <tr>{row.map((item) => <td>{item}</td>)}</tr>;
  });

  return (
    <TableWrapper>
      <table>
        {headerRow}
        {dataRows}
      </table>
    </TableWrapper>
  );
};
