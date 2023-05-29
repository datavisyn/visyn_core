import * as React from 'react';
import { Group, MultiSelect, Stack, Text, Tooltip } from '@mantine/core';
import { forwardRef } from 'react';
import { ColumnInfo, EColumnTypes, VisColumn } from '../interfaces';
import { SelectDropdownItem, SelectLabelComponent } from './utils';

interface NumericalColumnSelectProps {
  callback: (s: ColumnInfo[]) => void;
  columns: VisColumn[];
  currentSelected: ColumnInfo[];
}

// SelectItem.displayName('SelectItem');

export function NumericalColumnSelect({ callback, columns, currentSelected }: NumericalColumnSelectProps) {
  const selectNumOptions = React.useMemo(() => {
    return columns.filter((c) => c.type === EColumnTypes.NUMERICAL).map((c) => ({ value: c.info.id, label: c.info.name, description: c.info.description }));
  }, [columns]);

  return (
    <MultiSelect
      withinPortal
      clearable
      valueComponent={SelectLabelComponent}
      itemComponent={SelectDropdownItem}
      label="Numerical columns"
      onChange={(e: string[]) => {
        callback(columns.filter((c) => e.includes(c.info.id)).map((c) => c.info));
      }}
      name="numColumns"
      data={selectNumOptions}
      value={currentSelected.map((c) => c.id)}
    />
  );
}
