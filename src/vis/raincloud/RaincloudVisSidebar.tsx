import * as React from 'react';
import { useMemo } from 'react';
import merge from 'lodash/merge';
import { Container, Divider, Stack } from '@mantine/core';
import { ColumnInfo, ESupportedPlotlyVis, IScatterConfig, IVisConfig, VisColumn, ICommonVisSideBarProps, EColumnTypes, IRaincloudConfig } from '../interfaces';
import { VisTypeSelect } from '../sidebar/VisTypeSelect';
import { NumericalColumnSelect } from '../sidebar/NumericalColumnSelect';
import { ColorSelect } from '../sidebar/ColorSelect';
import { FilterButtons } from '../sidebar/FilterButtons';
import { SingleColumnSelect } from '../sidebar/SingleColumnSelect';
import { OpacitySlider } from '../sidebar/OpacitySlider';

export function RaincloudVisSidebar({
  config,
  optionsConfig,
  extensions,
  columns,
  setConfig,
}: {
  config: IRaincloudConfig;
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
  setConfig: (config: IVisConfig) => void;
} & ICommonVisSideBarProps) {
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
      </Stack>
    </Container>
  );
}
