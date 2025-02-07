import * as React from 'react';

import { Select } from '@mantine/core';

import { AggregationType } from './math';

export function AggregateSelect({
  label,
  aggregation,
  setAggregation,
}: {
  label: string;
  aggregation: AggregationType;
  setAggregation: (value: AggregationType) => void;
}) {
  return (
    <Select
      allowDeselect={false}
      ml="xs"
      w={300}
      label={label}
      value={aggregation}
      onChange={setAggregation as (value: string | null) => void}
      data={[
        {
          label: 'Minimum',
          value: 'min',
        },
        {
          label: 'Maximum',
          value: 'max',
        },
        {
          label: 'Mean',
          value: 'mean',
        },
        {
          label: 'Median',
          value: 'median',
        },
      ]}
    />
  );
}
