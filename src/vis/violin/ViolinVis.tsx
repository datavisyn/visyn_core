import { Stack, Center } from '@mantine/core';
import * as d3v7 from 'd3v7';
import uniqueId from 'lodash/uniqueId';
import React, { useEffect, useMemo, useState } from 'react';
import { useAsync } from '../../hooks';
import { PlotlyComponent, PlotlyTypes } from '../../plotly';
import { Plotly } from '../../plotly/full';
import { InvalidCols } from '../general';
import { beautifyLayout } from '../general/layoutUtils';
import { ICommonVisProps } from '../interfaces';
import { IViolinConfig } from './interfaces';
import { DownloadPlotButton } from '../general/DownloadPlotButton';
import { createViolinTraces } from './utils';

export function ViolinVis({
  config,
  columns,
  scales,
  dimensions,
  selectedList,
  selectedMap,
  selectionCallback,
  uniquePlotId,
  showDownloadScreenshot,
}: ICommonVisProps<IViolinConfig>) {
  const { value: traces, status: traceStatus, error: traceError } = useAsync(createViolinTraces, [columns, config, scales, selectedList, selectedMap]);
  const id = useMemo(() => uniquePlotId || uniqueId('ViolinVis'), [uniquePlotId]);
  console.log('selectedList', selectedList);
  const [layout, setLayout] = useState<Partial<Plotly.Layout>>(null);

  const onClick = (e: (Readonly<PlotlyTypes.PlotSelectionEvent> & { event: MouseEvent }) | null) => {
    if (!e || !e.points || !e.points[0]) {
      selectionCallback([]);
      return;
    }
    // whole violin selection vs single point selection
    const isViolinSelection = e.points.length === 5 && e.points.every((p) => p.pointIndex === 0);
    const shiftPressed = e.event.shiftKey;
    const allPoints = (e.points[0] as Readonly<PlotlyTypes.PlotSelectionEvent>['points'][number] & { fullData: { ids: string[] } })?.fullData.ids;

    if (!isViolinSelection) {
      const selected = allPoints[e.points[0].pointIndex];
      selectionCallback(selectedList.filter((s) => s === selected));
      return;
    }

    // Multiselect enabled
    if (shiftPressed) {
      // Filter out incoming ids in order to deselect violin/box element
      const newSelected = selectedList.filter((s) => !allPoints.includes(s));

      // If incoming ids were not in selected already, add them
      if (newSelected.length === selectedList.length) {
        newSelected.push(...allPoints);
      }

      selectionCallback(newSelected);
    }
    // Multiselect disabled
    else if (selectedList.length === allPoints.length && allPoints.every((tempId) => selectedMap[tempId])) {
      selectionCallback([]);
    } else {
      selectionCallback(allPoints);
    }
  };

  // NOTE: @dv-usama-ansari: This is an alternative way to delay the resize of plotly plots, but the dependencies of the `useCallback` are unknown if the function is wrapped in lodash `debounce`.
  // const resizePlotly = useCallback(
  //   debounce((plotDiv) => {
  //     Plotly.Plots.resize(plotDiv);
  //   }),
  //   [],
  // );

  useEffect(() => {
    const plotDiv = document.getElementById(id);
    if (plotDiv) {
      // NOTE: @dv-usama-ansari: This is a hack to update the plotly plots on resize.
      //  The `setTimeout` is used to pass the resize function to the next event loop, so that the plotly plots are rendered first.
      setTimeout(() => Plotly.Plots.resize(plotDiv));
    }
  }, [id, dimensions, traces]);

  useEffect(() => {
    if (!traces) {
      return;
    }

    const innerLayout: Partial<Plotly.Layout> = {
      showlegend: true,
      legend: {
        itemclick: false,
        itemdoubleclick: false,
      },
      margin: {
        t: 25,
        r: 25,
        l: 25,
        b: 25,
      },
      font: {
        family: 'Roboto, sans-serif',
      },
      clickmode: 'event+select',
      dragmode: 'lasso',
      autosize: true,
      grid: { rows: traces.rows, columns: traces.cols, xgap: 0.3, pattern: 'independent' },
      shapes: [],
    };

    setLayout((prev) => ({ ...prev, ...beautifyLayout(traces, innerLayout, prev, true) }));
  }, [traces]);

  return (
    <Stack
      gap={0}
      style={{
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
        // Disable plotly crosshair cursor
        '.nsewdrag': {
          cursor: 'pointer !important',
        },
      }}
    >
      {traceStatus === 'success' && layout && traces?.plots.length > 0 ? (
        <>
          {showDownloadScreenshot ? (
            <Center>
              <DownloadPlotButton uniquePlotId={id} config={config} />
            </Center>
          ) : null}
          <PlotlyComponent
            divId={id}
            data={[...traces.plots.map((p) => p.data), ...traces.legendPlots.map((p) => p.data)]}
            layout={layout}
            config={{ responsive: true, displayModeBar: false }}
            useResizeHandler
            style={{ width: '100%', height: '100%' }}
            onClick={onClick}
            onSelected={(s) => {
              console.log('selecting');
              // @ts-ignore
              selectionCallback(s.points.map((p) => p.fullData.ids[p.pointIndex]));
            }}
            // plotly redraws everything on updates, so you need to reappend title and
            onUpdate={() => {
              for (const p of traces.plots) {
                d3v7.select(`g .${p.data.xaxis}title`).style('pointer-events', 'all').append('title').text(p.xLabel);

                d3v7.select(`g .${p.data.yaxis}title`).style('pointer-events', 'all').append('title').text(p.yLabel);
              }
            }}
          />
        </>
      ) : traceStatus !== 'pending' && traceStatus !== 'idle' && layout ? (
        <InvalidCols headerMessage={traces?.errorMessageHeader} bodyMessage={traceError?.message || traces?.errorMessage} />
      ) : null}
    </Stack>
  );
}
