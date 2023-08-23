import { Container, Stack } from '@mantine/core';
import * as React from 'react';
import { ColumnInfo, EAggregateTypes, EColumnTypes, ESupportedPlotlyVis, VisColumn } from '../interfaces';
import { AggregateTypeSelect } from '../sidebar/AggregateTypeSelect';
import { CategoricalColumnSelect } from '../sidebar/CategoricalColumnSelect';
import { NumericalColorButtons } from '../sidebar/NumericalColorButtons';
import { VisTypeSelect } from '../sidebar/VisTypeSelect';
import { IHeatmapConfig } from './utils';

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
    <Container fluid p={10}>
      <Stack spacing="xs">
        <VisTypeSelect callback={(type: ESupportedPlotlyVis) => setConfig({ ...(config as any), type })} currentSelected={config.type} />
        <CategoricalColumnSelect
          callback={(catColumnsSelected: ColumnInfo[]) => setConfig({ ...config, catColumnsSelected })}
          columns={columns}
          currentSelected={config.catColumnsSelected || []}
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
      </Stack>
    </Container>
  );
}
