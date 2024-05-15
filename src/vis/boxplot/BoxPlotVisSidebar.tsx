import merge from 'lodash/merge';
import * as React from 'react';
import { useMemo } from 'react';
import { ColumnInfo, EColumnTypes, ICommonVisSideBarProps } from '../interfaces';
import { FilterButtons } from '../sidebar/FilterButtons';
import { MultiSelect } from '../sidebar/MultiSelect';
import { IBoxplotConfig } from '.';

const defaultConfig = {
  filter: {
    enable: true,
    customComponent: null,
  },
};

export function BoxPlotVisSidebar({ config, optionsConfig, columns, setConfig, filterCallback }: ICommonVisSideBarProps<IBoxplotConfig>) {
  const mergedOptionsConfig = useMemo(() => {
    return merge({}, defaultConfig, optionsConfig);
  }, [optionsConfig]);

  return (
    <>
      <MultiSelect
        callback={(numColumnsSelected: ColumnInfo[]) => setConfig({ ...config, numColumnsSelected })}
        columns={columns}
        currentSelected={config.numColumnsSelected || []}
        columnType={EColumnTypes.NUMERICAL}
      />
      <MultiSelect
        callback={(catColumnsSelected: ColumnInfo[]) => setConfig({ ...config, catColumnsSelected })}
        columns={columns}
        currentSelected={config.catColumnsSelected || []}
        columnType={EColumnTypes.CATEGORICAL}
      />

      {filterCallback && mergedOptionsConfig.filter.enable ? mergedOptionsConfig.filter.customComponent || <FilterButtons callback={filterCallback} /> : null}
    </>
  );
}
