import * as React from 'react';
import { Container, Divider, Stack } from '@mantine/core';
import { ColumnInfo, ESupportedPlotlyVis, IVisConfig, VisColumn, ICommonVisSideBarProps, IRaincloudConfig } from '../interfaces';
import { VisTypeSelect } from '../sidebar/VisTypeSelect';
import { NumericalColumnSelect } from '../sidebar/NumericalColumnSelect';
import { RaincloudCloudSelect } from '../sidebar/RaincloudCloudSelect';
import { RaincloudLightningSelect } from '../sidebar/RaincloudLightningSelect';
import { RaincloudRainSelect } from '../sidebar/RaincloudRainSelect';
import { AggregateRainSwitch } from '../sidebar/AggregateRainSwitch';

export function RaincloudVisSidebar({
  config,
  columns,
  setConfig,
}: {
  config: IRaincloudConfig;
  columns: VisColumn[];
  setConfig: (config: IVisConfig) => void;
} & ICommonVisSideBarProps<IRaincloudConfig>) {
  return (
    <Container fluid p={10}>
      <Stack spacing={0}>
        <VisTypeSelect callback={(type: ESupportedPlotlyVis) => setConfig({ ...(config as any), type })} currentSelected={config.type} />
        <Divider my="sm" />
        <NumericalColumnSelect
          callback={(numColumnsSelected: ColumnInfo[]) => setConfig({ ...config, numColumnsSelected })}
          columns={columns}
          currentSelected={config.numColumnsSelected || []}
        />
        <RaincloudCloudSelect callback={(cloud) => setConfig({ ...config, cloudType: cloud })} currentSelected={config.cloudType} />
        <RaincloudLightningSelect callback={(lightning) => setConfig({ ...config, lightningType: lightning })} currentSelected={config.lightningType} />
        <RaincloudRainSelect callback={(rain) => setConfig({ ...config, rainType: rain })} currentSelected={config.rainType} />
        <AggregateRainSwitch callback={(aggregateRain) => setConfig({ ...config, aggregateRain })} currentValue={config.aggregateRain} />
      </Stack>
    </Container>
  );
}