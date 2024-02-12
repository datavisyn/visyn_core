import * as React from 'react';
import { ColumnInfo, EColumnTypes, ICommonVisSideBarProps } from '../interfaces';
import { MultiSelect } from '../sidebar';
import { HexOpacitySwitch } from './HexOpacitySwitch';
import { HexSizeSlider } from './HexSizeSlider';
import { HexSizeSwitch } from './HexSizeSwitch';
import { HexbinOptionSelect } from './HexbinOptionSelect';
import { EHexbinOptions, IHexbinConfig } from './interfaces';
import { SingleSelect } from '../sidebar/SingleSelect';

export function HexbinVisSidebar({ config, columns, setConfig }: ICommonVisSideBarProps<IHexbinConfig>) {
  return (
    <>
      <MultiSelect
        callback={(numColumnsSelected: ColumnInfo[]) => setConfig({ ...config, numColumnsSelected })}
        columns={columns}
        currentSelected={config.numColumnsSelected || []}
        columnType={EColumnTypes.NUMERICAL}
      />
      <SingleSelect
        columnType={EColumnTypes.CATEGORICAL}
        label="Color by category"
        callback={(color: ColumnInfo) => setConfig({ ...config, color })}
        columns={columns}
        currentSelected={config.color}
      />
      {config.color ? (
        <HexbinOptionSelect callback={(hexbinOptions: EHexbinOptions) => setConfig({ ...config, hexbinOptions })} currentSelected={config.hexbinOptions} />
      ) : null}

      <HexSizeSlider currentValue={config.hexRadius} callback={(hexRadius: number) => setConfig({ ...config, hexRadius })} />
      <HexSizeSwitch currentValue={config.isSizeScale} callback={(isSizeScale: boolean) => setConfig({ ...config, isSizeScale })} />
      <HexOpacitySwitch currentValue={config.isOpacityScale} callback={(isOpacityScale: boolean) => setConfig({ ...config, isOpacityScale })} />
    </>
  );
}
