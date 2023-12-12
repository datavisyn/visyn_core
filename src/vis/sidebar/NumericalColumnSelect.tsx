import { MultiSelect } from '@mantine/core';
import * as React from 'react';
import { ColumnInfo, EColumnTypes, VisColumn } from '../interfaces';

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
      clearable
      label="Numerical columns"
      onChange={(e: string[]) => {
        callback(e.map((id) => columns.find((c) => c.info.id === id).info));
      }}
      // TODO: @MORITZ
      // valueComponent={SelectLabelComponent}
      // itemComponent={SelectDropdownItem}
      name="numColumns"
      data={selectNumOptions}
      value={currentSelected.map((c) => c.id)}
    />
  );
}
