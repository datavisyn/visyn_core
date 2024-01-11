import * as React from 'react';
import { ColumnInfo, ICommonVisSideBarProps } from '../interfaces';
import { ISankeyConfig } from './interfaces';
import { CategoricalMultiselect } from '../sidebar/CategoricalMultiselect';

export function SankeyVisSidebar({
  config,
  setConfig,
  className = '',
  columns,
  style: { width = '20em', ...style } = {},
}: ICommonVisSideBarProps<ISankeyConfig>) {
  return (
    <CategoricalMultiselect
      callback={(catColumnsSelected: ColumnInfo[]) => setConfig({ ...config, catColumnsSelected })}
      columns={columns}
      currentSelected={config.catColumnsSelected || []}
    />
  );
}
