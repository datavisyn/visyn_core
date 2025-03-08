import * as React from 'react';
import { EColumnTypes, ICommonVisSideBarProps } from '../interfaces';
import { ILineConfig } from './interfaces';
import { MultiSelect, SingleSelect } from '../sidebar';

export function LineVisSidebar({ config, setConfig, className = '', columns, style: { width = '20em', ...style } = {} }: ICommonVisSideBarProps<ILineConfig>) {
  return (
    <>
      <SingleSelect
        callback={(xAxisColumn) => setConfig({ ...config, xAxisColumn })}
        columns={columns}
        currentSelected={config.xAxisColumn}
        columnType={[EColumnTypes.NUMERICAL]}
        label="Select x-axis"
      />

      <MultiSelect
        callback={(numColumnsSelected) => setConfig({ ...config, numColumnsSelected })}
        columns={columns}
        currentSelected={config.numColumnsSelected || []}
        columnType={EColumnTypes.NUMERICAL}
        label="Select columns to plot"
      />
    </>
  );
}
