import merge from 'lodash/merge';
import * as React from 'react';
import { useMemo } from 'react';
import { ColumnInfo, EColumnTypes, ENumericalColorScaleType, ICommonVisSideBarProps } from '../interfaces';
import { FilterButtons } from '../sidebar/FilterButtons';
import { NumericalColumnSelect } from '../sidebar/NumericalColumnSelect';
import { SingleColumnSelect } from '../sidebar/SingleColumnSelect';
import { ColorSelect } from './ColorSelect';
import { OpacitySlider } from './OpacitySlider';
import { IScatterConfig } from './interfaces';

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
};

export function ScatterVisSidebar({ config, optionsConfig, columns, filterCallback, setConfig }: ICommonVisSideBarProps<IScatterConfig>) {
  const mergedOptionsConfig = useMemo(() => {
    return merge({}, defaultConfig, optionsConfig);
  }, [optionsConfig]);

  return (
    <>
      <NumericalColumnSelect
        callback={(numColumnsSelected: ColumnInfo[]) => setConfig({ ...config, numColumnsSelected })}
        columns={columns}
        currentSelected={config.numColumnsSelected || []}
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
            <SingleColumnSelect
              label="Shape"
              type={[EColumnTypes.CATEGORICAL]}
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

      {filterCallback && mergedOptionsConfig.filter.enable ? mergedOptionsConfig.filter.customComponent || <FilterButtons callback={filterCallback} /> : null}
    </>
  );
}
