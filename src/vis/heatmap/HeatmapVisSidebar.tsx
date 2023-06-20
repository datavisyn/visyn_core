import { Container, Stack } from '@mantine/core';
import * as React from 'react';
import { ColumnInfo, ENumericalColorScaleType, ESupportedPlotlyVis, IHeatmapConfig, IVisConfig, VisColumn } from '../interfaces';
import { VisTypeSelect } from '../sidebar/VisTypeSelect';
import { CategoricalColumnSelect } from '../sidebar/CategoricalColumnSelect';
import { ColorSelect } from '../sidebar/ColorSelect';

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

        <ColorSelect
          callback={(color: ColumnInfo) => setConfig({ ...config, color })}
          numTypeCallback={(numColorScaleType: ENumericalColorScaleType) => setConfig({ ...config, numColorScaleType })}
          currentNumType={config.numColorScaleType}
          columns={columns}
          currentSelected={config.color}
        />
      </Stack>
    </Container>
  );
}
