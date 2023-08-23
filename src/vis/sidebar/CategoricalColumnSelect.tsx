import { MultiSelect } from '@mantine/core';
import * as React from 'react';
import { ColumnInfo, EColumnTypes, VisColumn } from '../interfaces';
import { SelectDropdownItem } from './utils';

interface CategoricalColumnSelectProps {
  callback: (s: ColumnInfo[]) => void;
  columns: VisColumn[];
  currentSelected: ColumnInfo[];
}

export function CategoricalColumnSelect({ callback, columns, currentSelected }: CategoricalColumnSelectProps) {
  const selectCatOptions = React.useMemo(() => {
    return columns.filter((c) => c.type === EColumnTypes.CATEGORICAL).map((c) => ({ value: c.info.id, label: c.info.name, description: c.info.description }));
  }, [columns]);

  return (
    <MultiSelect
      withinPortal
      itemComponent={SelectDropdownItem}
      placeholder="Select columns"
      label="Categorical columns"
      clearable
      onChange={(e) => callback(e.map((id) => columns.find((c) => c.info.id === id).info))}
      name="numColumns"
      data={selectCatOptions}
      value={currentSelected.map((c) => c.id)}
    />
  );
}
