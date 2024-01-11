import { Select } from '@mantine/core';
import * as React from 'react';
import { useMemo } from 'react';
import { ColumnInfo, EAggregateTypes, EColumnTypes, VisColumn } from '../interfaces';
import { SingleSelect } from './SingleSelect';

interface AggregateTypeSelectProps {
  aggregateTypeSelectCallback: (s: EAggregateTypes) => void;
  aggregateColumn: ColumnInfo | null;
  aggregateColumnSelectCallback: (c: ColumnInfo) => void;
  columns: VisColumn[];
  currentSelected: EAggregateTypes;
}

export function AggregateTypeSelect({
  aggregateTypeSelectCallback,
  aggregateColumnSelectCallback,
  columns,
  currentSelected,
  aggregateColumn,
}: AggregateTypeSelectProps) {
  const hasNumCols = useMemo(() => {
    return !!columns.find((col) => col.type === EColumnTypes.NUMERICAL);
  }, [columns]);

  const selectOptions = React.useMemo(() => {
    return [
      { disabled: false, value: EAggregateTypes.COUNT, label: EAggregateTypes.COUNT },
      { disabled: !hasNumCols, value: EAggregateTypes.AVG, label: EAggregateTypes.AVG },
      { disabled: !hasNumCols, value: EAggregateTypes.MIN, label: EAggregateTypes.MIN },
      { disabled: !hasNumCols, value: EAggregateTypes.MAX, label: EAggregateTypes.MAX },
      { disabled: !hasNumCols, value: EAggregateTypes.MED, label: EAggregateTypes.MED },
    ];
  }, [hasNumCols]);

  return (
    <>
      <Select
        label="Aggregate type"
        onChange={(option) => aggregateTypeSelectCallback(option as EAggregateTypes)}
        name="numColumns"
        data={selectOptions || []}
        value={currentSelected || ''}
        withCheckIcon={false}
      />
      {currentSelected !== EAggregateTypes.COUNT ? (
        <SingleSelect
          columnType={EColumnTypes.NUMERICAL}
          isClearable={false}
          label="Aggregate Column"
          callback={(c: ColumnInfo) => aggregateColumnSelectCallback(c)}
          columns={columns}
          currentSelected={aggregateColumn}
        />
      ) : null}
    </>
  );
}
