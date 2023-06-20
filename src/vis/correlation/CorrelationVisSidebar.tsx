import * as React from 'react';
import { useMemo } from 'react';
import merge from 'lodash/merge';
import { Container, Divider, Stack, Switch } from '@mantine/core';
import { ColumnInfo, ESupportedPlotlyVis, IVisConfig, VisColumn, ICommonVisSideBarProps, EFilterOptions, ICorrelationConfig } from '../interfaces';
import { VisTypeSelect } from '../sidebar/VisTypeSelect';
import { NumericalColumnSelect } from '../sidebar/NumericalColumnSelect';

const defaultConfig = {
  group: {
    enable: true,
    customComponent: null,
  },
  multiples: {
    enable: true,
    customComponent: null,
  },
  direction: {
    enable: true,
    customComponent: null,
  },
  filter: {
    enable: true,
    customComponent: null,
  },
  groupType: {
    enable: true,
    customComponent: null,
  },
  display: {
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

export function CorrelationVisSidebar({
  config,
  optionsConfig,
  extensions,
  columns,
  filterCallback = () => null,
  setConfig,
  className = '',
  style: { width = '20em', ...style } = {},
}: {
  config: ICorrelationConfig;
  optionsConfig?: {
    group?: {
      enable?: boolean;
      customComponent?: React.ReactNode;
    };
    multiples?: {
      enable?: boolean;
      customComponent?: React.ReactNode;
    };
    direction?: {
      enable?: boolean;
      customComponent?: React.ReactNode;
    };
    groupingType?: {
      enable?: boolean;
      customComponent?: React.ReactNode;
    };
    filter?: {
      enable?: boolean;
      customComponent?: React.ReactNode;
    };
    display?: {
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
  filterCallback?: (s: EFilterOptions) => void;
  columns: VisColumn[];
  setConfig: (config: IVisConfig) => void;
} & ICommonVisSideBarProps) {
  const mergedOptionsConfig = useMemo(() => {
    return merge({}, defaultConfig, optionsConfig);
  }, [optionsConfig]);

  const mergedExtensions = useMemo(() => {
    return merge({}, defaultExtensions, extensions);
  }, [extensions]);

  return (
    <Container p={10} fluid>
      <VisTypeSelect callback={(type: ESupportedPlotlyVis) => setConfig({ ...(config as any), type })} currentSelected={config.type} />
      <Divider my="sm" />
      <Stack spacing={30}>
        <NumericalColumnSelect
          callback={(numColumnsSelected: ColumnInfo[]) => setConfig({ ...config, numColumnsSelected })}
          columns={columns}
          currentSelected={config.numColumnsSelected || []}
        />
        <Switch
          label="Significant only"
          checked={config.showSignificant || false}
          onChange={() => setConfig({ ...config, showSignificant: !config.showSignificant })}
        />
      </Stack>
    </Container>
  );
}
