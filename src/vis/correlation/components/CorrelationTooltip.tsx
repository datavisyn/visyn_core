import { Table } from '@mantine/core';
import * as React from 'react';
import { CorrelationPairProps } from './CircleCorrelationPair';

export function CorrelationTooltip({ value }: { value: CorrelationPairProps }) {
  return (
    <Table withBorder={false}>
      <thead>
        <tr>
          <th>{`${value.xName} -> ${value.yName}`}</th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Correlation</td>
          <td>{value.correlation.toFixed(2)}</td>
        </tr>
        <tr>
          <td>t-Statistic</td>
          <td>{value.tStatistic.toFixed(2)}</td>
        </tr>
        <tr>
          <td>pValue</td>
          <td>{value.pValue < 0.001 ? 'p < 0.001' : value.pValue.toFixed(2)}</td>
        </tr>
      </tbody>
    </Table>
  );
}
