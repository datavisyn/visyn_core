import * as React from 'react';
import { useMemo } from 'react';

import merge from 'lodash/merge';

import { ColumnInfo, EAggregateTypes, EColumnTypes, ICommonVisSideBarProps } from '../interfaces';
import { BarDirectionButtons, GroupSelect } from './components';
import { EBarDirection, EBarDisplayType, EBarGroupingType, IBarConfig } from './interfaces';
import { AggregateTypeSelect } from '../sidebar/AggregateTypeSelect';
import { FilterButtons } from '../sidebar/FilterButtons';
import { SingleSelect } from '../sidebar/SingleSelect';

const defaultConfig = {
  direction: { enable: true, customComponent: null as unknown },
  display: { enable: true, customComponent: null as unknown },
  filter: { enable: true, customComponent: null as unknown },
  group: { enable: true, customComponent: null as unknown },
  groupType: { enable: true, customComponent: null as unknown },
  facets: { enable: true, customComponent: null as unknown },
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
    <>
      <SingleSelect
        callback={(catColumnSelected: ColumnInfo) =>
          setConfig({
            ...config,
            catColumnSelected,
            facets: config.facets && config.facets.id === catColumnSelected?.id ? null : config.facets,
            group: config.group && config.group.id === catColumnSelected?.id ? null : config.group,
          })
        }
        columns={columns}
        currentSelected={config.catColumnSelected!}
        columnType={[EColumnTypes.CATEGORICAL]}
        label="Categorical column"
      />
      <AggregateTypeSelect
        aggregateTypeSelectCallback={(aggregateType: EAggregateTypes) => {
          if (config.aggregateColumn === null) {
            setConfig({
              ...config,
              aggregateType,
              aggregateColumn: (columns ?? []).find((col) => col.type === EColumnTypes.NUMERICAL)?.info as ColumnInfo,
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

      {mergedOptionsConfig.group.enable
        ? mergedOptionsConfig.group.customComponent || (
            <GroupSelect
              aggregateType={config.aggregateType}
              groupColumnSelectCallback={(group: ColumnInfo | null) => setConfig({ ...config, group })}
              groupTypeSelectCallback={(groupType: EBarGroupingType) => setConfig({ ...config, groupType })}
              groupDisplaySelectCallback={(display: EBarDisplayType) => setConfig({ ...config, display })}
              displayType={config.display}
              groupType={config.groupType}
              columns={columns}
              currentSelected={config.group}
            />
          )
        : null}
      {mergedOptionsConfig.facets.enable
        ? mergedOptionsConfig.facets.customComponent || (
            <SingleSelect
              callback={(facets: ColumnInfo) => setConfig({ ...config, facets })}
              columns={columns}
              currentSelected={config.facets!}
              label="Facets"
              columnType={[EColumnTypes.CATEGORICAL]}
            />
          )
        : null}
      {mergedOptionsConfig.direction.enable
        ? mergedOptionsConfig.direction.customComponent || (
            <BarDirectionButtons callback={(direction: EBarDirection) => setConfig({ ...config, direction })} currentSelected={config.direction} />
          )
        : null}

      {filterCallback && mergedOptionsConfig.filter.enable ? mergedOptionsConfig.filter.customComponent || <FilterButtons callback={filterCallback} /> : null}
    </>
  );
}
