import * as React from 'react';
import { ColumnInfo, EColumnTypes, ICommonVisSideBarProps, VisColumn } from '../interfaces';
import { MultiSelect } from '../sidebar/MultiSelect';
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
      <MultiSelect
        callback={(numColumnsSelected: ColumnInfo[]) => setConfig({ ...config, numColumnsSelected })}
        columns={columns}
        currentSelected={config.numColumnsSelected || []}
        columnType={EColumnTypes.NUMERICAL}
      />
      <RaincloudCloudSelect callback={(cloud) => setConfig({ ...config, cloudType: cloud })} currentSelected={config.cloudType} />
      <RaincloudLightningSelect callback={(lightning) => setConfig({ ...config, lightningType: lightning })} currentSelected={config.lightningType} />
      <RaincloudRainSelect callback={(rain) => setConfig({ ...config, rainType: rain })} currentSelected={config.rainType} />
      <AggregateRainSwitch callback={(aggregateRain) => setConfig({ ...config, aggregateRain })} currentValue={config.aggregateRain} />
    </>
  );
}
