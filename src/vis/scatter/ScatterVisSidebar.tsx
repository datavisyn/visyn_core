import { Divider } from '@mantine/core';
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
import { IRegressionLineOptions, RegressionLineOptions } from './Regression';
import { ELabelingOptions, IScatterConfig } from './interfaces';

const defaultConfig = {
  multiples: {
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
  },
};

export function ScatterVisSidebar({ config, optionsConfig, columns, filterCallback, setConfig }: ICommonVisSideBarProps<IScatterConfig>) {
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

      {mergedOptionsConfig.multiples.enable
        ? mergedOptionsConfig.multiples.customComponent || (
            <SingleSelect
              callback={(multiples: ColumnInfo) => setConfig({ ...config, multiples })}
              columns={columns.filter((c) => c.type === EColumnTypes.CATEGORICAL)}
              currentSelected={config.multiples}
              label="Multiples"
              columnType={EColumnTypes.CATEGORICAL}
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
              columnType={EColumnTypes.CATEGORICAL}
              callback={(shape: ColumnInfo) => setConfig({ ...config, shape })}
              columns={columns}
              currentSelected={config.shape}
            />
          )
        : null}
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
            />
          )
        : null}

      {filterCallback && mergedOptionsConfig.filter.enable ? mergedOptionsConfig.filter.customComponent || <FilterButtons callback={filterCallback} /> : null}
      <Divider mt="xs" />
      {mergedOptionsConfig.regressionLine.enable
        ? mergedOptionsConfig.regressionLine.customComponent || (
            <RegressionLineOptions
              callback={(regressionLineOptions: IRegressionLineOptions) => {
                if (config.regressionLineOptions !== regressionLineOptions) {
                  setConfig({ ...config, regressionLineOptions });
                }
              }}
              currentSelected={config.regressionLineOptions}
            />
          )
        : null}
    </>
  );
}
