import { CheckIcon, CloseButton, Combobox, Group, MultiSelect, Pill, PillsInput, useCombobox } from '@mantine/core';
import * as React from 'react';
import { ColumnInfo, EColumnTypes, VisColumn } from '../interfaces';
import { CustomCombobox } from './CustomCombobox';

interface CategoricalColumnSelectProps {
  callback: (s: ColumnInfo[]) => void;
  columns: VisColumn[];
  currentSelected: ColumnInfo[];
}

export function CategoricalColumnSelect({ callback, columns, currentSelected }: CategoricalColumnSelectProps) {
  const selectCatOptions = React.useMemo(() => {
    return columns.filter((c) => c.type === EColumnTypes.CATEGORICAL);
  }, [columns]);

  return <CustomCombobox onChange={(e) => callback(e)} columns={selectCatOptions} selected={currentSelected} />;
}
