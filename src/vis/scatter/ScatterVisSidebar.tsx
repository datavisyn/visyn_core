import merge from 'lodash/merge';
import * as React from 'react';
import { useMemo } from 'react';
import { ColumnInfo, EColumnTypes, ENumericalColorScaleType, ICommonVisSideBarProps } from '../interfaces';
import { FilterButtons } from '../sidebar/FilterButtons';
import { MultiSelect } from '../sidebar/MultiSelect';
import { SingleSelect } from '../sidebar/SingleSelect';
import { ColorSelect } from './ColorSelect';
import { OpacitySlider } from './OpacitySlider';
import { ELabelingOptions, IScatterConfig } from './interfaces';
import { LabelingOptions } from './LabelingOptions';

const defaultConfig = {
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
              callback={(labels: ELabelingOptions) => {
                if (config.labels !== labels) {
                  setConfig({ ...config, labels });
                }
              }}
              currentSelected={config.labels}
            />
          )
        : null}

      {filterCallback && mergedOptionsConfig.filter.enable ? mergedOptionsConfig.filter.customComponent || <FilterButtons callback={filterCallback} /> : null}
    </>
  );
}
