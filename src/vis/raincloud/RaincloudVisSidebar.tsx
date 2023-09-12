import { Container, Divider, Stack } from '@mantine/core';
import * as React from 'react';
import { ColumnInfo, ESupportedPlotlyVis, ICommonVisSideBarProps, VisColumn } from '../interfaces';
import { NumericalColumnSelect } from '../sidebar/NumericalColumnSelect';
import { VisTypeSelect } from '../sidebar/VisTypeSelect';
import { AggregateRainSwitch } from './AggregateRainSwitch';
import { RaincloudCloudSelect } from './RaincloudCloudSelect';
import { RaincloudLightningSelect } from './RaincloudLightningSelect';
import { RaincloudRainSelect } from './RaincloudRainSelect';
import { IRaincloudConfig } from './interfaces';

export function RaincloudVisSidebar({
  config,
  columns,
  setConfig,
}: {
  config: IRaincloudConfig;
  columns: VisColumn[];
  setConfig: (config: IRaincloudConfig) => void;
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
