import * as React from 'react';
import { ColumnInfo, ICommonVisSideBarProps } from '../interfaces';
import { CategoricalColumnSelect } from '../sidebar/CategoricalColumnSelect';
import { ISankeyConfig } from './interfaces';

export function SankeyVisSidebar({
  config,
  setConfig,
  className = '',
  columns,
  style: { width = '20em', ...style } = {},
}: ICommonVisSideBarProps<ISankeyConfig>) {
  return (
    <CategoricalColumnSelect
      callback={(catColumnsSelected: ColumnInfo[]) => setConfig({ ...config, catColumnsSelected })}
      columns={columns}
      currentSelected={config.catColumnsSelected || []}
    />
  );
}
