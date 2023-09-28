import * as React from 'react';
import { useMemo } from 'react';
import merge from 'lodash/merge';
import { Container, Divider, Stack } from '@mantine/core';
import {
  ColumnInfo,
  EBarDirection,
  EBarDisplayType,
  EBarGroupingType,
  ESupportedPlotlyVis,
  IBarConfig,
  IVisConfig,
  VisColumn,
  ICommonVisSideBarProps,
  EAggregateTypes,
  EColumnTypes,
  EFilterOptions,
} from '../interfaces';
import { VisTypeSelect } from '../sidebar/VisTypeSelect';
import { GroupSelect } from '../sidebar/GroupSelect';
import { BarDirectionButtons } from '../sidebar/BarDirectionButtons';
import { SingleColumnSelect } from '../sidebar/SingleColumnSelect';
import { AggregateTypeSelect } from '../sidebar/AggregateTypeSelect';
import { FilterButtons } from '../sidebar/FilterButtons';

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

export function BarVisSidebar({
  config,
  optionsConfig,
  extensions,
  columns,
  filterCallback = () => null,
  setConfig,
  className = '',
  style: { width = '20em', ...style } = {},
}: {
  config: IBarConfig;
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
      <Stack gap="sm">
        <SingleColumnSelect
          callback={(catColumnSelected: ColumnInfo) =>
            setConfig({
              ...config,
              catColumnSelected,
              multiples: config.multiples && config.multiples.id === catColumnSelected?.id ? null : config.multiples,
              group: config.group && config.group.id === catColumnSelected?.id ? null : config.group,
            })
          }
          columns={columns}
          currentSelected={config.catColumnSelected}
          type={[EColumnTypes.CATEGORICAL]}
          label="Categorical column"
        />
        <AggregateTypeSelect
          aggregateTypeSelectCallback={(aggregateType: EAggregateTypes) => {
            if (config.aggregateColumn === null) {
              setConfig({ ...config, aggregateType, aggregateColumn: columns.find((col) => col.type === EColumnTypes.NUMERICAL).info });
            } else {
              setConfig({ ...config, aggregateType });
            }
          }}
          aggregateColumnSelectCallback={(aggregateColumn: ColumnInfo) => setConfig({ ...config, aggregateColumn })}
          columns={columns}
          currentSelected={config.aggregateType}
          aggregateColumn={config.aggregateColumn}
        />
      </Stack>
      <Divider my="sm" />
      {mergedExtensions.preSidebar}

      <Stack gap="sm">
        {mergedOptionsConfig.group.enable
          ? mergedOptionsConfig.group.customComponent || (
              <GroupSelect
                groupColumnSelectCallback={(group: ColumnInfo) => setConfig({ ...config, group })}
                groupTypeSelectCallback={(groupType: EBarGroupingType) => setConfig({ ...config, groupType })}
                groupDisplaySelectCallback={(display: EBarDisplayType) => setConfig({ ...config, display })}
                displayType={config.display}
                groupType={config.groupType}
                columns={columns.filter((c) => config.catColumnSelected && c.info.id !== config.catColumnSelected.id)}
                currentSelected={config.group}
              />
            )
          : null}
        {mergedOptionsConfig.multiples.enable
          ? mergedOptionsConfig.multiples.customComponent || (
              <SingleColumnSelect
                callback={(multiples: ColumnInfo) => setConfig({ ...config, multiples })}
                columns={columns.filter((c) => config.catColumnSelected && c.info.id !== config.catColumnSelected.id)}
                currentSelected={config.multiples}
                label="Multiples"
                type={[EColumnTypes.CATEGORICAL]}
              />
            )
          : null}
      </Stack>
      <Divider my="sm" />
      {mergedOptionsConfig.direction.enable
        ? mergedOptionsConfig.direction.customComponent || (
            <BarDirectionButtons callback={(direction: EBarDirection) => setConfig({ ...config, direction })} currentSelected={config.direction} />
          )
        : null}
      {mergedOptionsConfig.filter.enable ? mergedOptionsConfig.filter.customComponent || <FilterButtons callback={filterCallback} /> : null}

      {mergedExtensions.postSidebar}
    </Container>
  );
}
