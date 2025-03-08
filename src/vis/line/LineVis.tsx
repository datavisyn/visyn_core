import { css } from '@emotion/react';
import { Center, Stack } from '@mantine/core';
import { uniqueId } from 'lodash';
import * as React from 'react';
import { useAsync } from '../../hooks/useAsync';
import { PlotlyComponent } from '../../plotly';
import { selectionColorDark } from '../../utils';
import { DownloadPlotButton } from '../general/DownloadPlotButton';
import { NAN_REPLACEMENT, VIS_NEUTRAL_COLOR, VIS_UNSELECTED_COLOR } from '../general/constants';
import { resolveColumnValues } from '../general/layoutUtils';
import { ICommonVisProps, VisCategoricalColumn, VisColumn, VisNumericalColumn } from '../interfaces';
import { ILineConfig } from './interfaces';
import { i18n } from '../../i18n';
import { WarningMessage } from '../general/WarningMessage';

export async function fetchData(columns: VisColumn[], config: ILineConfig) {
  const yAxisColumns: VisNumericalColumn[] = config.numColumnsSelected.map((c) => columns.find((col) => col.info.id === c.id) as VisNumericalColumn);
  const xAxisColumn: VisNumericalColumn = columns.find((col) => col.info.id === config.xAxisColumn.id) as VisNumericalColumn;

  return { yAxisColumns: await resolveColumnValues(yAxisColumns), xAxisColumn: (await resolveColumnValues([xAxisColumn]))[0] };
}

function generatePlotly(
  data: Awaited<ReturnType<typeof fetchData>>,
  optimisedSelection: Set<string>,
): {
  data: Partial<Plotly.PlotData>[];
  layout: Partial<Plotly.Layout>;
} | null {
  if (!data.xAxisColumn) {
    return null;
  }
  const selected = selectionColorDark;
  const def = optimisedSelection.size > 0 ? VIS_UNSELECTED_COLOR : VIS_NEUTRAL_COLOR;

  const x = data.xAxisColumn.resolvedValues.map((v) => v.val!);

  return {
    data: data.yAxisColumns.map((yAxisColumn, i) => ({
      mode: 'lines',
      name: yAxisColumn.info.name,
      x,
      y: yAxisColumn.resolvedValues.map((v) => v.val!),
      yaxis: i === 0 ? 'y' : `y${i + 1}`,
    })),
    layout: {
      legend: {
        traceorder: 'reversed',
        orientation: 'h',
      },
      yaxis: { domain: [0, 0.3] },
      yaxis2: { domain: [0.35, 0.65] },
      yaxis3: { domain: [0.7, 1] },
      font: {
        size: 12,
      },
      autosize: true,
    },
  };
}

const classes = css({
  flexGrow: 1,
  height: '100%',
  width: '100%',
  overflow: 'hidden',
  position: 'relative',
  // Disable plotly crosshair cursor
  '.nsewdrag': {
    cursor: 'pointer !important',
  },
});

export function LineVis({ config, columns, selectedList, selectionCallback, dimensions, uniquePlotId, showDownloadScreenshot }: ICommonVisProps<ILineConfig>) {
  const [selection, setSelection] = React.useState<string[]>([]);
  const id = React.useMemo(() => uniquePlotId || uniqueId('LineVis'), [uniquePlotId]);
  const { value: data } = useAsync(fetchData, [columns, config]);

  const [plotly, setPlotly] = React.useState<ReturnType<typeof generatePlotly> | null>();

  // When we have new data -> recreate plotly
  React.useEffect(() => {
    const optimisedSelection = new Set(selection);

    if (!data) {
      setPlotly(null);
    } else {
      setPlotly(generatePlotly(data, optimisedSelection));
    }
  }, [selection, data]);

  React.useEffect(() => {
    setSelection(selectedList);
  }, [selectedList]);

  return (
    <Stack
      pl={0}
      pr={0}
      className={classes.name}
      style={{
        flexGrow: 1,
        height: '100%',
        width: '100%',
      }}
    >
      {showDownloadScreenshot && plotly ? (
        <Center>
          <DownloadPlotButton uniquePlotId={id} config={config} />
        </Center>
      ) : null}
      {plotly ? (
        <PlotlyComponent
          divId={id}
          data={plotly.data}
          layout={plotly.layout}
          style={{ width: '100%', height: '100%' }}
          config={{ displayModeBar: false }}
          onClick={(sel) => {
            if (!sel.points[0]) {
              return;
            }

            const element = sel.points[0] as (typeof sel.points)[0] & { index: number };

            if ('sourceLinks' in element) {
              selectionCallback(data.nodes.inverseLookup[element.index]);
            } else {
              selectionCallback(data.links.inverseLookup[element.index]);
            }
          }}
        />
      ) : (
        <Center h="100%">
          <WarningMessage centered dataTestId="visyn-vis-missing-column-warning" title={i18n.t('visyn:vis.missingColumn.errorHeader')}>
            {i18n.t('visyn:vis.missingColumn.lineError')}
          </WarningMessage>
        </Center>
      )}
    </Stack>
  );
}
