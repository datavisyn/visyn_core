import * as React from 'react';
import { ColumnInfo, EAggregateTypes, EColumnTypes, VisColumn } from '../interfaces';
import { AggregateTypeSelect } from '../sidebar/AggregateTypeSelect';
import { NumericalColorButtons } from '../sidebar/NumericalColorButtons';
import { IHeatmapConfig } from './interfaces';
import { MultiSelect } from '../sidebar';

export function HeatmapVisSidebar({
  config,
  columns,
  setConfig,
}: {
  config: IHeatmapConfig;
  columns: VisColumn[];
  setConfig: (config: IHeatmapConfig) => void;
}) {
  return (
    <>
      <MultiSelect
        callback={(catColumnsSelected: ColumnInfo[]) => setConfig({ ...config, catColumnsSelected })}
        columns={columns}
        currentSelected={config.catColumnsSelected || []}
        columnType={EColumnTypes.CATEGORICAL}
      />
      {config?.catColumnsSelected?.length > 1 ? (
        <NumericalColorButtons callback={(numColorScaleType) => setConfig({ ...config, numColorScaleType })} currentSelected={config.numColorScaleType} />
      ) : null}
      <AggregateTypeSelect
        aggregateTypeSelectCallback={(aggregateType: EAggregateTypes) => {
          if (config.aggregateColumn === null) {
            setConfig({
              ...config,
              aggregateType,
              aggregateColumn: columns.find((col) => col.type === EColumnTypes.NUMERICAL).info,
            });
          } else {
            setConfig({ ...config, aggregateType });
          }
        }}
        aggregateColumnSelectCallback={(aggregateColumn: ColumnInfo) => setConfig({ ...config, aggregateColumn })}
        columns={columns}
        currentSelected={config.aggregateType}
        aggregateColumn={config.aggregateColumn}
      />
      {/* Disabled until the animations are fixed. By default animations are disabled */}
      {/* <Switch
        checked={config.isAnimationEnabled}
        onChange={(event) => setConfig({ ...config, isAnimationEnabled: event.currentTarget.checked })}
        label={i18n.t('visyn:vis.animation')}
      /> */}
    </>
  );
}
