import * as React from 'react';
import { ColumnInfo, EColumnTypes, ICommonVisSideBarProps } from '../interfaces';
import { ISankeyConfig } from './interfaces';
import { MultiSelect } from '../sidebar';

export function SankeyVisSidebar({
  config,
  setConfig,
  className = '',
  columns,
  style: { width = '20em', ...style } = {},
}: ICommonVisSideBarProps<ISankeyConfig>) {
  return (
    <MultiSelect
      callback={(catColumnsSelected: ColumnInfo[]) => setConfig({ ...config, catColumnsSelected })}
      columns={columns}
      currentSelected={config.catColumnsSelected || []}
      columnType={EColumnTypes.CATEGORICAL}
    />
  );
}
