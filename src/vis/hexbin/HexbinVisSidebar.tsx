import * as React from 'react';
import { ColumnInfo, EColumnTypes, ICommonVisSideBarProps } from '../interfaces';
import { MultiSelect } from '../sidebar';
import { SingleColumnSelect } from '../sidebar/SingleColumnSelect';
import { HexOpacitySwitch } from './HexOpacitySwitch';
import { HexSizeSlider } from './HexSizeSlider';
import { HexSizeSwitch } from './HexSizeSwitch';
import { HexbinOptionSelect } from './HexbinOptionSelect';
import { EHexbinOptions, IHexbinConfig } from './interfaces';

export function HexbinVisSidebar({ config, columns, setConfig }: ICommonVisSideBarProps<IHexbinConfig>) {
  return (
    <>
      <MultiSelect
        callback={(numColumnsSelected: ColumnInfo[]) => setConfig({ ...config, numColumnsSelected })}
        columns={columns}
        currentSelected={config.numColumnsSelected || []}
        columnType={EColumnTypes.NUMERICAL}
      />
      <SingleColumnSelect
        type={[EColumnTypes.CATEGORICAL]}
        label="Categorical column"
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
