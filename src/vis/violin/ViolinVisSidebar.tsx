import merge from 'lodash/merge';
import * as React from 'react';
import { useMemo } from 'react';
import { ColumnInfo, ICommonVisSideBarProps } from '../interfaces';
import { CategoricalColumnSelect } from '../sidebar/CategoricalColumnSelect';
import { FilterButtons } from '../sidebar/FilterButtons';
import { NumericalColumnSelect } from '../sidebar/NumericalColumnSelect';
import { ViolinOverlayButtons } from './ViolinOverlayButtons';
import { EViolinOverlay, IViolinConfig } from './interfaces';

const defaultConfig = {
  overlay: {
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
    return merge({}, defaultConfig, optionsConfig as Record<string, unknown>);
  }, [optionsConfig]);

  return (
    <>
      <NumericalColumnSelect
        callback={(numColumnsSelected: ColumnInfo[]) => setConfig({ ...config, numColumnsSelected })}
        columns={columns}
        currentSelected={config.numColumnsSelected || []}
      />
      <CategoricalColumnSelect
        callback={(catColumnsSelected: ColumnInfo[]) => setConfig({ ...config, catColumnsSelected })}
        columns={columns}
        currentSelected={config.catColumnsSelected || []}
      />

      {mergedOptionsConfig.overlay.enable
        ? mergedOptionsConfig.overlay.customComponent || (
            <ViolinOverlayButtons
              callback={(violinOverlay: EViolinOverlay) => setConfig({ ...config, violinOverlay })}
              currentSelected={config.violinOverlay}
            />
          )
        : null}

      {mergedOptionsConfig.filter.enable ? mergedOptionsConfig.filter.customComponent || <FilterButtons callback={filterCallback} /> : null}
    </>
  );
}
