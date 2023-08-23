import { Container, Divider, Stack } from '@mantine/core';
import merge from 'lodash/merge';
import * as React from 'react';
import { useMemo } from 'react';
import { ColumnInfo, EAggregateTypes, EColumnTypes, ICommonVisSideBarProps } from '../interfaces';
import { AggregateTypeSelect } from '../sidebar/AggregateTypeSelect';
import { BarDirectionButtons } from '../sidebar/BarDirectionButtons';
import { FilterButtons } from '../sidebar/FilterButtons';
import { GroupSelect } from '../sidebar/GroupSelect';
import { SingleColumnSelect } from '../sidebar/SingleColumnSelect';
import { VisTypeSelect } from '../sidebar/VisTypeSelect';
import { EBarDirection, EBarDisplayType, EBarGroupingType, IBarConfig } from './utils';

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

export function BarVisSidebar({
  config,
  optionsConfig,
  columns,
  setConfig,
  className = '',
  filterCallback,
  style: { width = '20em', ...style } = {},
}: ICommonVisSideBarProps<IBarConfig>) {
  const mergedOptionsConfig = useMemo(() => {
    return merge({}, defaultConfig, optionsConfig);
  }, [optionsConfig]);

  return (
    <Container p={10} fluid>
      <VisTypeSelect callback={(type: string) => setConfig({ ...(config as any), type })} currentSelected={config.type} />
      <Divider my="sm" />
      <Stack spacing="sm">
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
              setConfig({
                ...config,
                aggregateType,
                aggregateColumn: columns.find((col) => col.type === EColumnTypes.NUMERICAL).info,
                display: aggregateType === EAggregateTypes.COUNT ? config.display : EBarDisplayType.ABSOLUTE,
              });
            } else {
              setConfig({ ...config, aggregateType, display: aggregateType === EAggregateTypes.COUNT ? config.display : EBarDisplayType.ABSOLUTE });
            }
          }}
          aggregateColumnSelectCallback={(aggregateColumn: ColumnInfo) => setConfig({ ...config, aggregateColumn })}
          columns={columns}
          currentSelected={config.aggregateType}
          aggregateColumn={config.aggregateColumn}
        />
      </Stack>
      <Divider my="sm" />

      <Stack spacing="sm">
        {mergedOptionsConfig.group.enable
          ? mergedOptionsConfig.group.customComponent || (
              <GroupSelect
                aggregateType={config.aggregateType}
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
    </Container>
  );
}