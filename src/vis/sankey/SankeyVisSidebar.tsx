import * as React from 'react';
import { Container, Stack } from '@mantine/core';
import { ColumnInfo, ESupportedPlotlyVis, ICommonVisSideBarProps, ISankeyConfig } from '../interfaces';
import { CategoricalColumnSelect } from '../sidebar/CategoricalColumnSelect';
import { VisTypeSelect } from '../sidebar/VisTypeSelect';

export function SankeyVisSidebar({
  config,
  setConfig,
  className = '',
  columns,
  style: { width = '20em', ...style } = {},
}: ICommonVisSideBarProps<ISankeyConfig>) {
  return (
    <Container fluid p={10}>
      <Stack spacing={0}>
        <VisTypeSelect callback={(type: ESupportedPlotlyVis) => setConfig({ ...(config as any), type })} currentSelected={config.type} />
        <CategoricalColumnSelect
          callback={(catColumnsSelected: ColumnInfo[]) => setConfig({ ...config, catColumnsSelected })}
          columns={columns}
          currentSelected={config.catColumnsSelected || []}
        />
      </Stack>
    </Container>
  );
}