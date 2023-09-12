import { Center, Group, SimpleGrid, Stack } from '@mantine/core';
import merge from 'lodash/merge';
import * as React from 'react';
import { useMemo } from 'react';
import { i18n } from '../../i18n';
import { InvalidCols } from '../general';
import { EScatterSelectSettings, ICommonVisProps } from '../interfaces';
import { BrushOptionButtons } from '../sidebar';
import { Hexplot } from './Hexplot';
import { IHexbinConfig } from './interfaces';

const defaultExtensions = {
  prePlot: null,
  postPlot: null,
  preSidebar: null,
  postSidebar: null,
};

export function HexbinVis({
  config,
  extensions,
  columns,
  setConfig,
  selectionCallback = () => null,
  selectedMap = {},
  showDragModeOptions = true,
}: ICommonVisProps<IHexbinConfig>) {
  const mergedExtensions = useMemo(() => {
    return merge({}, defaultExtensions, extensions);
  }, [extensions]);

  return (
    <Stack spacing={0} sx={{ height: '100%', width: '100%' }}>
      {showDragModeOptions ? (
        <Center>
          <Group mt="lg">
            <BrushOptionButtons
              callback={(dragMode: EScatterSelectSettings) => setConfig({ ...config, dragMode })}
              options={[EScatterSelectSettings.RECTANGLE, EScatterSelectSettings.PAN]}
              dragMode={config.dragMode}
            />
          </Group>
        </Center>
      ) : null}
      <SimpleGrid style={{ height: '100%' }} cols={config.numColumnsSelected.length > 2 ? config.numColumnsSelected.length : 1}>
        {config.numColumnsSelected.length < 2 ? (
          <InvalidCols headerMessage={i18n.t('visyn:vis.errorHeader')} bodyMessage={i18n.t('visyn:vis.hexbinError')} />
        ) : (
          <>
            {config.numColumnsSelected.length > 2 ? (
              config.numColumnsSelected.map((xCol) => {
                return config.numColumnsSelected.map((yCol) => {
                  if (xCol.id !== yCol.id) {
                    return (
                      <Hexplot
                        key={yCol.id + xCol.id}
                        selectionCallback={selectionCallback}
                        selected={selectedMap}
                        config={config}
                        columns={[
                          columns.find((col) => col.info.id === yCol.id),
                          columns.find((col) => col.info.id === xCol.id),
                          columns.find((col) => col.info.id === config.color?.id),
                        ]}
                      />
                    );
                  }

                  return <div key={`${xCol.id}hist`} />;
                });
              })
            ) : (
              <Hexplot
                selectionCallback={selectionCallback}
                selected={selectedMap}
                config={config}
                columns={[
                  columns.find((col) => col.info.id === config.numColumnsSelected[0].id),
                  columns.find((col) => col.info.id === config.numColumnsSelected[1].id),
                  columns.find((col) => col.info.id === config.color?.id),
                ]}
              />
            )}
            {mergedExtensions.postPlot}
          </>
        )}
      </SimpleGrid>
    </Stack>
  );
}
