import * as React from 'react';

import { Center, Loader, Stack } from '@mantine/core';
import uniqueId from 'lodash/uniqueId';

import { useAsync } from '../../hooks/useAsync';
import { VisColumn } from '../interfaces';
import { Heatmap } from './Heatmap';
import { IHeatmapConfig } from './interfaces';
import { getHeatmapData } from './utils';
import { i18n } from '../../i18n';
import { DownloadPlotButton } from '../general/DownloadPlotButton';
import { WarningMessage } from '../general/WarningMessage';

export function HeatmapGrid({
  config,
  columns,
  selected,
  setExternalConfig,
  selectionCallback,
  uniquePlotId,
  showDownloadScreenshot,
}: {
  config: IHeatmapConfig;
  columns: VisColumn[];
  selectionCallback?: (ids: string[]) => void;
  setExternalConfig?: (config: IHeatmapConfig) => void;
  selected?: { [key: string]: boolean };
  uniquePlotId: string;
  showDownloadScreenshot: boolean;
}) {
  const id = React.useMemo(() => uniquePlotId || uniqueId('HeatmapVis'), [uniquePlotId]);
  const { value: allColumns, status } = useAsync(getHeatmapData, [columns, config.catColumnsSelected, config.aggregateColumn]);
  const hasAtLeast2CatCols = allColumns?.catColumn && allColumns?.catColumn?.length > 1;

  const margin = React.useMemo(() => {
    return {
      top: 10,
      right: 20,
      bottom: 30,
      left: 40,
    };
  }, []);

  return (
    <Stack align="center" justify="center" style={{ width: '100%', height: '100%' }} p="sm">
      {status === 'pending' && <Loader />}
      {status === 'success' && hasAtLeast2CatCols && (
        <>
          {showDownloadScreenshot ? (
            <Center>
              <DownloadPlotButton uniquePlotId={id} config={config} />
            </Center>
          ) : null}
          <Heatmap
            column1={allColumns.catColumn[0]}
            column2={allColumns.catColumn[1]}
            aggregateColumn={allColumns.aggregateColumn}
            margin={margin}
            plotId={id}
            config={config}
            selected={selected}
            setExternalConfig={setExternalConfig}
            selectionCallback={selectionCallback}
          />
        </>
      )}
      {status === 'success' && !hasAtLeast2CatCols && (
        <WarningMessage centered dataTestId="visyn-vis-missing-column-warning" title={i18n.t('visyn:vis.missingColumn.errorHeader')}>
          {i18n.t('visyn:vis.missingColumn.heatmapError')}
        </WarningMessage>
      )}
    </Stack>
  );
}
