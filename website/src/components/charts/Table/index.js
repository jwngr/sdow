import React from 'react';
import {TableWrapper} from './index.styles';

const Table = ({headers, rows}) => {
  const headerRow = (
    <tr key="table-header-row">
      {headers.map((header, i) => {
        if (typeof header === 'string') {
          return <th key={`table-row-header-col${i}`}>{header}</th>;
        } else {
          return (
            <th width={header.width} key={`table-row-header-col${i}`}>
              {header.text}
            </th>
          );
        }
      })}
    </tr>
  );

  const dataRows = rows.map((row, i) => {
    return (
      <tr key={`table-row-${i}`}>
        {row.map((item, j) => (
          <td key={`table-row-${i}-col${j}`}>{item}</td>
        ))}
      </tr>
    );
  });

  return (
    <TableWrapper>
      <table>
        <thead>{headerRow}</thead>
        <tbody>{dataRows}</tbody>
      </table>
    </TableWrapper>
  );
};

export default Table;
