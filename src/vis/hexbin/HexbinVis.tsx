import * as React from 'react';
import merge from 'lodash/merge';
import { useMemo } from 'react';
import { Center, Group, SimpleGrid, Stack } from '@mantine/core';
import { IHexbinConfig, EScatterSelectSettings, ICommonVisProps } from '../interfaces';
import { InvalidCols } from '../general';
import { i18n } from '../../i18n';
import { Hexplot } from './Hexplot';
import { BrushOptionButtons } from '../sidebar';

const defaultExtensions = {
  prePlot: null,
  postPlot: null,
  preSidebar: null,
  postSidebar: null,
};

export function HexbinVis({
  externalConfig,
  extensions,
  columns,
  setExternalConfig,
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
              callback={(dragMode: EScatterSelectSettings) => setExternalConfig({ ...externalConfig, dragMode })}
              options={[EScatterSelectSettings.RECTANGLE, EScatterSelectSettings.PAN]}
              dragMode={externalConfig.dragMode}
            />
          </Group>
        </Center>
      ) : null}
      <SimpleGrid style={{ height: '100%' }} cols={externalConfig.numColumnsSelected.length > 2 ? externalConfig.numColumnsSelected.length : 1}>
        {externalConfig.numColumnsSelected.length < 2 ? (
          <InvalidCols headerMessage={i18n.t('visyn:vis.errorHeader')} bodyMessage={i18n.t('visyn:vis.hexbinError')} />
        ) : (
          <>
            {externalConfig.numColumnsSelected.length > 2 ? (
              externalConfig.numColumnsSelected.map((xCol) => {
                return externalConfig.numColumnsSelected.map((yCol) => {
                  if (xCol.id !== yCol.id) {
                    return (
                      <Hexplot
                        key={yCol.id + xCol.id}
                        selectionCallback={selectionCallback}
                        selected={selectedMap}
                        config={externalConfig}
                        columns={[
                          columns.find((col) => col.info.id === yCol.id),
                          columns.find((col) => col.info.id === xCol.id),
                          columns.find((col) => col.info.id === externalConfig.color?.id),
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
                config={externalConfig}
                columns={[
                  columns.find((col) => col.info.id === externalConfig.numColumnsSelected[0].id),
                  columns.find((col) => col.info.id === externalConfig.numColumnsSelected[1].id),
                  columns.find((col) => col.info.id === externalConfig.color?.id),
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
