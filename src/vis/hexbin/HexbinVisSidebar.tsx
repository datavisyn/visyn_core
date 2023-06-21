import * as React from 'react';
import { Container, Divider, Stack } from '@mantine/core';
import { ColumnInfo, EColumnTypes, EHexbinOptions, ESupportedPlotlyVis, ICommonVisSideBarProps, IHexbinConfig, VisColumn } from '../interfaces';
import { VisTypeSelect } from '../sidebar/VisTypeSelect';
import { NumericalColumnSelect } from '../sidebar';
import { SingleColumnSelect } from '../sidebar/SingleColumnSelect';
import { HexSizeSlider } from '../sidebar/HexSizeSlider';
import { HexbinOptionSelect } from '../sidebar/HexbinOptionSelect';
import { HexSizeSwitch } from '../sidebar/HexSizeSwitch';
import { HexOpacitySwitch } from '../sidebar/HexOpacitySwitch';

export function HexbinVisSidebar({ config, columns, setConfig }: ICommonVisSideBarProps<IHexbinConfig>) {
  return (
    <Container fluid p={10}>
      <Stack spacing={0}>
        <VisTypeSelect callback={(type: ESupportedPlotlyVis) => setConfig({ ...(config as any), type })} currentSelected={config.type} />
        <Divider my="sm" />
        <Stack>
          <NumericalColumnSelect
            callback={(numColumnsSelected: ColumnInfo[]) => setConfig({ ...config, numColumnsSelected })}
            columns={columns}
            currentSelected={config.numColumnsSelected || []}
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
        </Stack>
        <Divider my="sm" />
        <Stack>
          <HexSizeSlider currentValue={config.hexRadius} callback={(hexRadius: number) => setConfig({ ...config, hexRadius })} />
          <HexSizeSwitch currentValue={config.isSizeScale} callback={(isSizeScale: boolean) => setConfig({ ...config, isSizeScale })} />
          <HexOpacitySwitch currentValue={config.isOpacityScale} callback={(isOpacityScale: boolean) => setConfig({ ...config, isOpacityScale })} />
        </Stack>
      </Stack>
    </Container>
  );
}
