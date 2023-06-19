import { Container, Stack } from '@mantine/core';
import * as React from 'react';
import { ColumnInfo, ESupportedPlotlyVis, IHeatmapConfig, IVisConfig, VisColumn } from '../interfaces';
import { VisTypeSelect } from '../sidebar/VisTypeSelect';
import { CategoricalColumnSelect } from '../sidebar/CategoricalColumnSelect';

export function HeatmapVisSidebar({ config, columns, setConfig }: { config: IHeatmapConfig; columns: VisColumn[]; setConfig: (config: IVisConfig) => void }) {
  return (
    <Container fluid p={10}>
      <Stack spacing={0}>
        <CategoricalColumnSelect
          callback={(catColumnsSelected: ColumnInfo[]) => setConfig({ ...config, catColumnsSelected })}
          columns={columns}
          currentSelected={config.catColumnsSelected || []}
        />
        <VisTypeSelect callback={(type: ESupportedPlotlyVis) => setConfig({ ...(config as any), type })} currentSelected={config.type} />
      </Stack>
    </Container>
  );
}
