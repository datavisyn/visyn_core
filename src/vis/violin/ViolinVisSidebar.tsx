import merge from 'lodash/merge';
import * as React from 'react';
import { useMemo } from 'react';
import { ColumnInfo, EColumnTypes, ICommonVisSideBarProps } from '../interfaces';
import { FilterButtons } from '../sidebar/FilterButtons';
import { MultiSelect } from '../sidebar/MultiSelect';
import { ViolinSeparationSegmentedControl, ViolinOverlaySegmentedControl } from './ViolinSegmentedControl';
import { EViolinSeparationMode, EViolinOverlay, IViolinConfig } from './interfaces';

const defaultConfig = {
  overlay: {
    enable: true,
    customComponent: null,
  },
  multiplesMode: {
    enable: true,
    customComponent: null,
  },
  filter: {
    enable: true,
    customComponent: null,
  },
};

export function ViolinVisSidebar({
  config,
  optionsConfig,
  columns,
  setConfig,
  className = '',
  style: { width = '20em', ...style } = {},
  filterCallback,
}: ICommonVisSideBarProps<IViolinConfig>) {
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

      {mergedOptionsConfig.overlay.enable
        ? mergedOptionsConfig.overlay.customComponent || (
            <ViolinOverlaySegmentedControl
              callback={(violinOverlay: EViolinOverlay) => setConfig({ ...config, violinOverlay })}
              currentSelected={config.violinOverlay}
            />
          )
        : null}

      {mergedOptionsConfig.multiplesMode.enable
        ? mergedOptionsConfig.multiplesMode.customComponent || (
            <ViolinSeparationSegmentedControl
              callback={(multiplesMode: EViolinSeparationMode) => setConfig({ ...config, multiplesMode })}
              currentSelected={config.multiplesMode}
            />
          )
        : null}

      {filterCallback && mergedOptionsConfig.filter.enable ? mergedOptionsConfig.filter.customComponent || <FilterButtons callback={filterCallback} /> : null}
    </>
  );
}
