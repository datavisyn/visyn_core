import { useShallowEffect } from '@mantine/hooks';
import merge from 'lodash/merge';
import React, { useMemo, useState } from 'react';
import { ColumnInfo, EAggregateTypes, EColumnTypes, ICommonVisSideBarProps } from '../interfaces';
import { AggregateTypeSelect } from '../sidebar/AggregateTypeSelect';
import { FilterButtons } from '../sidebar/FilterButtons';
import { SingleSelect } from '../sidebar/SingleSelect';
import { BarDirectionButtons } from './BarDirectionButtons';
import { GroupSelect } from './GroupSelect';
import { EBarDirection, EBarDisplayType, EBarGroupingType, IBarConfig } from './interfaces';

const defaultConfig = {
  direction: { enable: true, customComponent: null },
  display: { enable: true, customComponent: null },
  filter: { enable: true, customComponent: null },
  group: { enable: true, customComponent: null },
  groupType: { enable: true, customComponent: null },
  facets: { enable: true, customComponent: null },
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

  const [selectedColumn, setSelectedColumn] = useState<{ column: ColumnInfo; columnType: EColumnTypes }>(
    config.catColumnSelected
      ? { column: config.catColumnSelected, columnType: EColumnTypes.CATEGORICAL }
      : config.numColumnSelected
        ? { column: config.numColumnSelected, columnType: EColumnTypes.NUMERICAL }
        : null,
  );

  // NOTE: @dv-usama-ansari: useEffect causes an infinite loop here.
  useShallowEffect(() => {
    setConfig({
      ...config,
      catColumnSelected: selectedColumn?.columnType === EColumnTypes.CATEGORICAL ? selectedColumn?.column : null,
      numColumnSelected: selectedColumn?.columnType === EColumnTypes.NUMERICAL ? selectedColumn?.column : null,
      facets: config.facets && config.facets.id === selectedColumn?.column?.id ? null : config.facets,
      group: config.group && config.group.id === selectedColumn?.column?.id ? null : config.group,
    });
  }, [selectedColumn?.column, selectedColumn?.columnType, setConfig]);

  return (
    <>
      <SingleSelect
        callback={(column: ColumnInfo) => {
          setSelectedColumn(() => {
            const c = columns.find((col) => col.info.id === column?.id);
            return !c ? null : { column: c.info, columnType: c.type };
          });
        }}
        columns={columns}
        currentSelected={selectedColumn?.column}
        columnTypes={[EColumnTypes.CATEGORICAL, EColumnTypes.NUMERICAL]}
        label="Select a column"
      />
      {!selectedColumn ? null : (
        <>
          {selectedColumn?.columnType === EColumnTypes.CATEGORICAL ? (
            <>
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
              {mergedOptionsConfig.facets.enable
                ? mergedOptionsConfig.facets.customComponent || (
                    <SingleSelect
                      callback={(facets: ColumnInfo) => setConfig({ ...config, facets })}
                      columns={columns.filter((c) => config.catColumnSelected && c.info.id !== config.catColumnSelected.id)}
                      currentSelected={config.facets}
                      label="Facets"
                      columnTypes={[EColumnTypes.CATEGORICAL]}
                    />
                  )
                : null}
            </>
          ) : null}
          {mergedOptionsConfig.direction.enable
            ? mergedOptionsConfig.direction.customComponent || (
                <BarDirectionButtons callback={(direction: EBarDirection) => setConfig({ ...config, direction })} currentSelected={config.direction} />
              )
            : null}

          {filterCallback && mergedOptionsConfig.filter.enable
            ? mergedOptionsConfig.filter.customComponent || <FilterButtons callback={filterCallback} />
            : null}
        </>
      )}
    </>
  );
}
