import * as React from 'react';
import { useMemo } from 'react';
import merge from 'lodash/merge';
import { Container, Divider, SegmentedControl, Stack, Switch, Text } from '@mantine/core';
import {
  ColumnInfo,
  ESupportedPlotlyVis,
  IVisConfig,
  VisColumn,
  ICommonVisSideBarProps,
  EFilterOptions,
  ICorrelationConfig,
  ECorrelationPlotMode,
  EColumnTypes,
  ECorrelationType,
} from '../interfaces';
import { VisTypeSelect } from '../sidebar/VisTypeSelect';
import { NumericalColumnSelect } from '../sidebar/NumericalColumnSelect';
import { CategoricalColumnSelect } from '../sidebar/CategoricalColumnSelect';
import { SingleColumnSelect } from '../sidebar/SingleColumnSelect';
import { SingleValueSelect } from '../sidebar/SingleValueSelect';
import { resolveColumnValues, resolveSingleColumn } from '../general/layoutUtils';

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

  const onFilterCriteriaChange = (filterCriteria: ColumnInfo) => {
    if (filterCriteria === undefined && config.filterCriteria) {
      setConfig({ ...config, filterCriteria: null, filterValue: null, availableFilterValues: [] });
    }

    if (filterCriteria) {
      const getPossibleFilterValues = async (): Promise<string[]> => {
        const columnResolved = await resolveSingleColumn(columns.find((col) => col.info.id === filterCriteria.id));
        return [...new Set(columnResolved.resolvedValues.map((v) => v.val as string))];
      };
      getPossibleFilterValues().then((values) => {
        setConfig({
          ...config,
          filterCriteria,
          availableFilterValues: values,
        });
      });
    }
  };

  return (
    <Container p={10} fluid>
      <VisTypeSelect callback={(type: ESupportedPlotlyVis) => setConfig({ ...(config as any), type })} currentSelected={config.type} />
      <Divider my="sm" />
      <Stack>
        <SingleColumnSelect
          callback={(filterCriteria: ColumnInfo) => onFilterCriteriaChange(filterCriteria)}
          columns={columns}
          currentSelected={config.filterCriteria}
          label="Filter by"
          type={[EColumnTypes.CATEGORICAL]}
        />
        <SingleValueSelect
          callback={(filterValue: string) => setConfig({ ...config, filterValue })}
          availableFilterValues={config.availableFilterValues}
          currentSelected={config.filterValue}
          placeholder={config.filterCriteria ? `Select ${config.filterCriteria.name}` : '---'}
        />
      </Stack>
      <Divider my="sm" />
      <Stack spacing={25}>
        <NumericalColumnSelect
          callback={(numColumnsSelected: ColumnInfo[]) => setConfig({ ...config, numColumnsSelected })}
          columns={columns}
          currentSelected={config.numColumnsSelected || []}
        />
        <Stack spacing="xs">
          <Text size="sm" fw={500}>
            Correlation type
          </Text>
          <SegmentedControl
            size="sm"
            data={Object.values(ECorrelationType)}
            value={config.correlationType}
            onChange={(v) => setConfig({ ...config, correlationType: v as ECorrelationType })}
          />
        </Stack>
        <Stack spacing="xs">
          <Text size="sm" fw={500}>
            Lower triangle
          </Text>
          <SegmentedControl
            size="sm"
            data={Object.values(ECorrelationPlotMode)}
            value={config.mode}
            onChange={(v) => setConfig({ ...config, mode: v as ECorrelationPlotMode })}
          />
        </Stack>
        <Switch
          label="Significant"
          checked={config.highlightSignificant || false}
          onChange={() => setConfig({ ...config, highlightSignificant: !config.highlightSignificant })}
        />
      </Stack>
    </Container>
  );
}
