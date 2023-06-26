import { Group, Table, Text } from '@mantine/core';
import * as React from 'react';
import { CorrelationPairProps } from './CorrelationPair';

export function CorrelationTooltip({ value }: { value: CorrelationPairProps }) {
  return (
    <Table withBorder={false}>
      <thead>
        <tr>
          <th>
            <Group>
              {`${value.xName}`}
              <Text>&#x27F6;</Text>
              {`${value.yName}`}
            </Group>
          </th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>correlation</td>
          <td>{value.correlation.toFixed(2)}</td>
        </tr>
        <tr>
          <td>t-statistic</td>
          <td>{value.tStatistic.toFixed(2)}</td>
        </tr>
        <tr>
          <td>p-value</td>
          <td>{value.pValue < 0.001 ? '< 0.001' : value.pValue.toFixed(2)}</td>
        </tr>
      </tbody>
    </Table>
  );
}
