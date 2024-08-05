import merge from 'lodash/merge';
import * as React from 'react';
import { useMemo } from 'react';
import { ColumnInfo, EColumnTypes, ICommonVisSideBarProps } from '../interfaces';
import { FilterButtons } from '../sidebar/FilterButtons';
import { MultiSelect } from '../sidebar/MultiSelect';
import { SingleSelect } from '../sidebar/SingleSelect';
import { ViolinOverlaySegmentedControl, ViolinSyncYAxisSegmentedControl } from './ViolinSegmentedControl';
import { EViolinOverlay, EYAxisMode, IViolinConfig, isViolinConfig } from './interfaces';

const defaultConfig = {
  subCategory: {
    enable: true,
    customComponent: null,
  },
  facets: {
    enable: true,
    customComponent: null,
  },
  overlay: {
    enable: true,
    customComponent: null,
  },
  syncXAxis: {
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

      <SingleSelect
        label="Categorical column"
        columnType={[EColumnTypes.CATEGORICAL]}
        callback={(catColumnSelected: ColumnInfo) => setConfig({ ...config, catColumnSelected })}
        columns={columns.filter((c) => c.info.id !== config.facetBy?.id && c.info.id !== config.subCategorySelected?.id)}
        currentSelected={config.catColumnSelected}
      />
      {mergedOptionsConfig.subCategory.enable
        ? mergedOptionsConfig.subCategory.customComponent || (
            <SingleSelect
              label="Subcategory"
              columnType={[EColumnTypes.CATEGORICAL]}
              callback={(subCategorySelected: ColumnInfo) => setConfig({ ...config, subCategorySelected })}
              columns={columns.filter((c) => c.info.id !== config.catColumnSelected?.id && c.info.id !== config.facetBy?.id)}
              currentSelected={config.subCategorySelected}
            />
          )
        : null}
      {mergedOptionsConfig.facets.enable
        ? mergedOptionsConfig.facets.customComponent || (
            <SingleSelect
              label="Facets"
              columnType={[EColumnTypes.CATEGORICAL]}
              callback={(facetBy: ColumnInfo) => setConfig({ ...config, facetBy })}
              columns={columns.filter((c) => c.info.id !== config.catColumnSelected?.id && c.info.id !== config.subCategorySelected?.id)}
              currentSelected={config.facetBy}
              disabled={config.numColumnsSelected.length > 1}
              disabledTooltip="Facets are disabled with more than one numerical column selected."
            />
          )
        : null}
      {mergedOptionsConfig.syncXAxis.enable
        ? mergedOptionsConfig.syncXAxis.customComponent || (
            <ViolinSyncYAxisSegmentedControl
              callback={(syncYAxis: EYAxisMode) => setConfig({ ...config, syncYAxis })}
              currentSelected={config.syncYAxis}
              disabled={config.numColumnsSelected.length < 2 && !config.facetBy}
            />
          )
        : null}
      {mergedOptionsConfig.overlay.enable
        ? mergedOptionsConfig.overlay.customComponent || (
            <ViolinOverlaySegmentedControl
              callback={(overlay: EViolinOverlay) => setConfig({ ...config, overlay })}
              currentSelected={config.overlay}
              isViolin={isViolinConfig(config)}
            />
          )
        : null}
      {filterCallback && mergedOptionsConfig.filter.enable ? mergedOptionsConfig.filter.customComponent || <FilterButtons callback={filterCallback} /> : null}
    </>
  );
}
