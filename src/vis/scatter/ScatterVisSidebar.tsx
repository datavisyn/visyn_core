import { Divider, Select } from '@mantine/core';
import merge from 'lodash/merge';
import * as React from 'react';
import { useMemo } from 'react';
import { ColumnInfo, EColumnTypes, ENumericalColorScaleType, ICommonVisSideBarProps } from '../interfaces';
import { FilterButtons } from '../sidebar/FilterButtons';
import { MultiSelect } from '../sidebar/MultiSelect';
import { SingleSelect } from '../sidebar/SingleSelect';
import { ColorSelect } from './ColorSelect';
import { LabelingOptions } from './LabelingOptions';
import { OpacitySlider } from './OpacitySlider';
import { RegressionLineOptions } from './Regression';
import { ELabelingOptions, IInternalScatterConfig, IRegressionLineOptions } from './interfaces';

const defaultConfig = {
  facets: {
    enable: true,
    customComponent: null,
  },
  color: {
    enable: true,
    customComponent: null,
  },
  shape: {
    enable: true,
    customComponent: null,
  },
  filter: {
    enable: true,
    customComponent: null,
  },
  labels: {
    enable: true,
    customComponent: null,
  },
  regressionLine: {
    enable: true,
    customComponent: null,
    showColorPicker: true,
  },
};

export function ScatterVisSidebar({ config, optionsConfig, columns, filterCallback, setConfig }: ICommonVisSideBarProps<IInternalScatterConfig>) {
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

      {mergedOptionsConfig.facets.enable
        ? mergedOptionsConfig.facets.customComponent || (
            <SingleSelect
              label="Facets"
              columnType={[EColumnTypes.CATEGORICAL, EColumnTypes.NUMERICAL]}
              callback={(facets: ColumnInfo) => setConfig({ ...config, facets })}
              columns={columns.filter((c) => c.type === EColumnTypes.CATEGORICAL)}
              currentSelected={config.facets}
            />
          )
        : null}

      {mergedOptionsConfig.color.enable
        ? mergedOptionsConfig.color.customComponent || (
            <ColorSelect
              callback={(color: ColumnInfo) => setConfig({ ...config, color })}
              numTypeCallback={(numColorScaleType: ENumericalColorScaleType) => setConfig({ ...config, numColorScaleType })}
              currentNumType={config.numColorScaleType}
              columns={columns}
              currentSelected={config.color}
            />
          )
        : null}
      {mergedOptionsConfig.shape.enable
        ? mergedOptionsConfig.shape.customComponent || (
            <SingleSelect
              label="Shape"
              columnType={[EColumnTypes.CATEGORICAL]}
              callback={(shape: ColumnInfo) => setConfig({ ...config, shape })}
              columns={columns}
              currentSelected={config.shape}
            />
          )
        : null}
      <MultiSelect
        callback={(labelColumns: ColumnInfo[]) => setConfig({ ...config, labelColumns })}
        columns={columns}
        currentSelected={config.labelColumns || []}
        label="Tooltip labels"
      />
      <OpacitySlider
        callback={(e) => {
          if (config.alphaSliderVal !== e) {
            setConfig({ ...config, alphaSliderVal: e });
          }
        }}
        currentValue={config.alphaSliderVal}
      />
      {mergedOptionsConfig.labels.enable
        ? mergedOptionsConfig.labels.customComponent || (
            <LabelingOptions
              callback={(showLabels: ELabelingOptions) => {
                if (config.showLabels !== showLabels) {
                  setConfig({ ...config, showLabels });
                }
              }}
              currentSelected={config.showLabels}
              labelLimit={config.selectedPointsCount > config.showLabelLimit ? config.showLabelLimit : 0}
            />
          )
        : null}
      {mergedOptionsConfig.regressionLine.enable
        ? mergedOptionsConfig.regressionLine.customComponent || (
            <>
              <Divider mt="xs" />
              <RegressionLineOptions
                callback={(regressionLineOptions: IRegressionLineOptions) => {
                  if (config.regressionLineOptions !== regressionLineOptions) {
                    setConfig({ ...config, regressionLineOptions });
                  }
                }}
                currentSelected={config.regressionLineOptions}
                showColorPicker={mergedOptionsConfig.regressionLine.showColorPicker}
              />
            </>
          )
        : null}

      <Select
        label="X axis type"
        data={[
          { value: 'linear', label: 'Linear' },
          { value: 'log', label: 'Logarithmic' },
        ]}
        clearable={false}
        value={config.xAxisType}
        onChange={(value) => {
          setConfig({ ...config, xAxisType: value as 'log' | 'linear' });
        }}
      />

      <Select
        label="Y axis type"
        data={[
          { value: 'linear', label: 'Linear' },
          { value: 'log', label: 'Logarithmic' },
        ]}
        clearable={false}
        value={config.yAxisType}
        onChange={(value) => {
          setConfig({ ...config, yAxisType: value as 'log' | 'linear' });
        }}
      />

      {filterCallback && mergedOptionsConfig.filter.enable
        ? mergedOptionsConfig.filter.customComponent || (
            <>
              <Divider mt="xs" />
              <FilterButtons callback={filterCallback} />
            </>
          )
        : null}
    </>
  );
}
