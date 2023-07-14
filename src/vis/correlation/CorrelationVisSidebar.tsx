import * as React from 'react';
import { useMemo } from 'react';
import merge from 'lodash/merge';
import { ActionIcon, Container, Divider, Group, NumberInput, SegmentedControl, Stack, Switch, Text, Tooltip } from '@mantine/core';
import * as d3 from 'd3v7';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import {
  ColumnInfo,
  ESupportedPlotlyVis,
  IVisConfig,
  VisColumn,
  ICommonVisSideBarProps,
  EFilterOptions,
  ICorrelationConfig,
  ECorrelationType,
  EScaleType,
} from '../interfaces';
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
} & ICommonVisSideBarProps<ICorrelationConfig>) {
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
          <Text size="sm" fw={500}>
            P value scale type
          </Text>
          <SegmentedControl
            size="sm"
            data={Object.values(EScaleType)}
            value={config.pScaleType}
            onChange={(v) => setConfig({ ...config, pScaleType: v as EScaleType })}
          />
          <NumberInput
            styles={{ input: { width: '100%' }, label: { width: '100%' } }}
            precision={20}
            min={0}
            max={1}
            step={0.05}
            formatter={(value) => {
              return d3.format('.3~g')(+value);
            }}
            onChange={(val) => setConfig({ ...config, pDomain: [+val, config.pDomain[1]] })}
            label={
              <Group style={{ width: '100%' }} position="apart">
                <Text>Maximum P Value</Text>
                <Tooltip
                  withinPortal
                  withArrow
                  arrowSize={6}
                  label={
                    <Group>
                      <Text>Sets the maximum p value for the size scale. Any p value at or above this value will have the smallest possible circle</Text>
                    </Group>
                  }
                >
                  <ActionIcon>
                    <FontAwesomeIcon icon={faQuestionCircle} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            }
            value={config.pDomain[0]}
          />
          <NumberInput
            styles={{ input: { width: '100%' }, label: { width: '100%' } }}
            precision={20}
            min={0}
            max={1}
            step={0.05}
            formatter={(value) => {
              return d3.format('.3~g')(+value);
            }}
            onChange={(val) => setConfig({ ...config, pDomain: [config.pDomain[0], +val] })}
            label={
              <Group style={{ width: '100%' }} position="apart">
                <Text>Minimum P Value</Text>
                <Tooltip
                  withinPortal
                  withArrow
                  arrowSize={6}
                  label={
                    <Group>
                      <Text>Sets the minimum p value for the size scale. Any p value at or below this value will have the largest possible circle</Text>
                    </Group>
                  }
                >
                  <ActionIcon>
                    <FontAwesomeIcon icon={faQuestionCircle} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            }
            value={config.pDomain[1]}
          />
        </Stack>
      </Stack>
    </Container>
  );
}
