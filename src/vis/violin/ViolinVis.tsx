import { Stack } from '@mantine/core';
import * as d3v7 from 'd3v7';
import uniqueId from 'lodash/uniqueId';
import React, { useEffect, useMemo, useState } from 'react';
import { useAsync } from '../../hooks';
import { PlotlyComponent, PlotlyTypes } from '../../plotly';
import { Plotly } from '../../plotly/full';
import { InvalidCols } from '../general';
import { beautifyLayout } from '../general/layoutUtils';
import { ICommonVisProps } from '../interfaces';
import { createViolinTraces } from './utils';
import { IViolinConfig } from './interfaces';

export function ViolinVis({ config, columns, scales, dimensions, selectedList, selectedMap, selectionCallback }: ICommonVisProps<IViolinConfig>) {
  const { value: traces, status: traceStatus, error: traceError } = useAsync(createViolinTraces, [columns, config, scales, selectedList, selectedMap]);
  const [clearTimeoutValue, setClearTimeoutValue] = useState(null);

  const id = useMemo(() => uniqueId('ViolinVis'), []);

  const [layout, setLayout] = useState<Partial<Plotly.Layout>>(null);

  const onClick = (e: Readonly<PlotlyTypes.PlotSelectionEvent> | null) => {
    if (!e || !e.points || !e.points[0]) {
      selectionCallback([]);
      return;
    }

    // @ts-ignore
    const shiftPressed = e.event.shiftKey;
    // @ts-ignore
    const eventIds = e.points[0]?.fullData.ids;

    // Multiselect enabled
    if (shiftPressed) {
      // Filter out incoming ids in order to deselect violin/box element
      const newSelected = selectedList.filter((s) => !eventIds.includes(s));

      // If incoming ids were not in selected already, add them
      if (newSelected.length === selectedList.length) {
        newSelected.push(...eventIds);
      }

      selectionCallback(newSelected);
    }
    // Multiselect disabled
    else if (selectedList.length === eventIds.length && eventIds.every((tempId) => selectedMap[tempId])) {
      selectionCallback([]);
    } else {
      selectionCallback(eventIds);
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
    const plotDiv = document.getElementById(`plotlyDiv${id}`);
    if (plotDiv) {
      // NOTE: @dv-usama-ansari: This is a hack to update the plotly plots on resize.
      //  The `setTimeout` is used to pass the resize function to the next event loop, so that the plotly plots are rendered first.
      const n = setTimeout(() => Plotly.Plots.resize(plotDiv));
      setClearTimeoutValue(n);
    }
  }, [id, dimensions, traces]);

  // NOTE: @dv-usama-ansari: Clear the timeout on unmount.
  useEffect(() => {
    return () => {
      if (clearTimeoutValue) {
        clearTimeout(clearTimeoutValue);
      }
    };
  }, [clearTimeoutValue]);

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
      autosize: true,
      grid: { rows: traces.rows, columns: traces.cols, xgap: 0.3, pattern: 'independent' },
      shapes: [],
    };

    setLayout((prev) => ({ ...prev, ...beautifyLayout(traces, innerLayout, prev, true) }));
  }, [traces]);

  return (
    <Stack
      spacing={0}
      sx={{
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
        <PlotlyComponent
          divId={`plotlyDiv${id}`}
          data={[...traces.plots.map((p) => p.data), ...traces.legendPlots.map((p) => p.data)]}
          layout={layout}
          config={{ responsive: true, displayModeBar: false }}
          useResizeHandler
          style={{ width: '100%', height: '100%' }}
          onClick={onClick}
          // plotly redraws everything on updates, so you need to reappend title and
          onUpdate={() => {
            for (const p of traces.plots) {
              d3v7.select(`g .${p.data.xaxis}title`).style('pointer-events', 'all').append('title').text(p.xLabel);

              d3v7.select(`g .${p.data.yaxis}title`).style('pointer-events', 'all').append('title').text(p.yLabel);
            }
          }}
        />
      ) : traceStatus !== 'pending' && traceStatus !== 'idle' && layout ? (
        <InvalidCols headerMessage={traces?.errorMessageHeader} bodyMessage={traceError?.message || traces?.errorMessage} />
      ) : null}
    </Stack>
  );
}
