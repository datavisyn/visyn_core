import * as React from 'react';
import { ColumnInfo, ICommonVisSideBarProps, VisColumn } from '../interfaces';
import { NumericalColumnSelect } from '../sidebar/NumericalColumnSelect';
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
    <>
      <NumericalColumnSelect
        callback={(numColumnsSelected: ColumnInfo[]) => setConfig({ ...config, numColumnsSelected })}
        columns={columns}
        currentSelected={config.numColumnsSelected || []}
      />
      <RaincloudCloudSelect callback={(cloud) => setConfig({ ...config, cloudType: cloud })} currentSelected={config.cloudType} />
      <RaincloudLightningSelect callback={(lightning) => setConfig({ ...config, lightningType: lightning })} currentSelected={config.lightningType} />
      <RaincloudRainSelect callback={(rain) => setConfig({ ...config, rainType: rain })} currentSelected={config.rainType} />
      <AggregateRainSwitch callback={(aggregateRain) => setConfig({ ...config, aggregateRain })} currentValue={config.aggregateRain} />
    </>
  );
}
