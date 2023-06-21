import { Container, Stack } from '@mantine/core';
import * as React from 'react';
import { ColumnInfo, ESupportedPlotlyVis, IHeatmapConfig, IVisConfig, VisColumn } from '../interfaces';
import { CategoricalColumnSelect } from '../sidebar/CategoricalColumnSelect';
import { NumericalColorButtons } from '../sidebar/NumericalColorButtons';
import { VisTypeSelect } from '../sidebar/VisTypeSelect';

export function HeatmapVisSidebar({ config, columns, setConfig }: { config: IHeatmapConfig; columns: VisColumn[]; setConfig: (config: IVisConfig) => void }) {
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
      </Stack>
    </Container>
  );
}
