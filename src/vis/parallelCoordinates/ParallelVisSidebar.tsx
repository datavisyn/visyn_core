import * as React from 'react';
import { useMemo } from 'react';
import merge from 'lodash/merge';
import { Container, Divider, Stack } from '@mantine/core';
import { ColumnInfo, EFilterOptions, ESupportedPlotlyVis, IVisConfig, VisColumn, ICommonVisSideBarProps, IParallelCoordinatesConfig } from '../interfaces';
import { VisTypeSelect } from '../sidebar/VisTypeSelect';
import { NumericalColumnSelect } from '../sidebar/NumericalColumnSelect';
import { FilterButtons } from '../sidebar/FilterButtons';
import { CategoricalColumnSelect } from '../sidebar/CategoricalColumnSelect';

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

const defaultExtensions = {
  prePlot: null,
  postPlot: null,
  preSidebar: null,
  postSidebar: null,
};

export function ParallelVisSidebar({
  config,
  optionsConfig,
  extensions,
  columns,
  filterCallback = () => null,
  setConfig,
}: {
  config: IParallelCoordinatesConfig;
  optionsConfig?: {
    color?: {
      enable?: boolean;
      customComponent?: React.ReactNode;
    };
    shape?: {
      enable?: boolean;
      customComponent?: React.ReactNode;
    };
    filter?: {
      enable?: boolean;
      customComponent?: React.ReactNode;
    };
  };
  extensions?: {
    prePlot?: React.ReactNode;
    postPlot?: React.ReactNode;
    preSidebar?: React.ReactNode;
    postSidebar?: React.ReactNode;
  };
  columns: VisColumn[];
  filterCallback?: (s: EFilterOptions) => void;
  setConfig: (config: IVisConfig) => void;
} & ICommonVisSideBarProps<IParallelCoordinatesConfig>) {
  const mergedOptionsConfig = useMemo(() => {
    return merge({}, defaultConfig, optionsConfig);
  }, [optionsConfig]);

  const mergedExtensions = useMemo(() => {
    return merge({}, defaultExtensions, extensions);
  }, [extensions]);

  return (
    <Container fluid p={10}>
      <Stack spacing={0}>
        <VisTypeSelect callback={(type: ESupportedPlotlyVis) => setConfig({ ...(config as any), type })} currentSelected={config.type} />
        <Divider my="sm" />
        <NumericalColumnSelect
          callback={(numColumnsSelected: ColumnInfo[]) => setConfig({ ...config, numColumnsSelected })}
          columns={columns}
          currentSelected={config.numColumnsSelected || []}
        />
        <Divider />
        <CategoricalColumnSelect
          callback={(catColumnsSelected: ColumnInfo[]) => setConfig({ ...config, catColumnsSelected })}
          columns={columns}
          currentSelected={config.catColumnsSelected || []}
        />
        {mergedExtensions.preSidebar}
        {mergedOptionsConfig.filter.enable ? mergedOptionsConfig.filter.customComponent || <FilterButtons callback={filterCallback} /> : null}
        {mergedExtensions.postSidebar}
      </Stack>
    </Container>
  );
}
