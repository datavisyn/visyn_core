import { Stack } from '@mantine/core';
import * as d3v7 from 'd3v7';
import uniqueId from 'lodash/uniqueId';
import React, { useEffect, useMemo, useState } from 'react';
import { categoricalColors } from 'visyn_core/utils';
import { useAsync } from '../../hooks';
import { PlotlyComponent, PlotlyTypes } from '../../plotly';
import { Plotly } from '../../plotly/full';
import { InvalidCols } from '../general';
import { SELECT_COLOR } from '../general/constants';
import { beautifyLayout } from '../general/layoutUtils';
import { ICommonVisProps } from '../interfaces';
import { IViolinConfig } from './interfaces';
import { createViolinTraces } from './utils';

export function ViolinVis({ config, columns, scales, dimensions, selectedList, selectedMap, selectionCallback }: ICommonVisProps<IViolinConfig>) {
  const { value: traces, status: traceStatus, error: traceError } = useAsync(createViolinTraces, [columns, config, scales, selectedList, selectedMap]);
  const [clearTimeoutValue, setClearTimeoutValue] = useState(null);

  const id = useMemo(() => uniqueId('ViolinVis'), []);

  const [layout, setLayout] = useState<Partial<Plotly.Layout>>(null);
  const [currentSelectedX, setCurrentSelectedX] = useState<string[]>([]);

  // Filter out null values from traces as null values cause the tooltip to not show up
  const filteredTraces = useMemo(() => {
    if (!traces) return null;
    const indexWithNull = traces.plots?.map(
      (plot) => (plot?.data.y as PlotlyTypes.Datum[])?.reduce((acc: number[], curr, i) => (curr === null ? [...acc, i] : acc), []) as number[],
    );
    const y = (traces?.plots?.[0]?.data?.y as PlotlyTypes.Datum[])?.filter((v, i) => !indexWithNull[0].includes(i));
    const x = (traces?.plots?.[0]?.data?.x as PlotlyTypes.Datum[])?.filter((v, i) => !indexWithNull[0].includes(i));
    const uniqueX = [...new Set(x)];
    const filtered = {
      ...traces,
      plots: traces?.plots?.map((p, p_index) => {
        return {
          ...p,
          data: {
            ...p.data,
            y,
            x,
            ids: p.data?.ids?.filter((v, i) => !indexWithNull[p_index].includes(i)),
            transforms: [
              {
                type: 'groupby',
                groups: x,
                styles: uniqueX.map((cat) => ({
                  target: cat,
                  value: { line: { color: currentSelectedX.includes(cat as string) ? SELECT_COLOR : categoricalColors[9] } },
                })),
              },
            ],
          },
        };
      }),
    };
    return filtered;
  }, [currentSelectedX, traces]);

  const onClick = (e: (Readonly<PlotlyTypes.PlotSelectionEvent> & { event: MouseEvent }) | null) => {
    if (!e || !e.points || !e.points[0]) {
      selectionCallback([]);
      return;
    }

    const shiftPressed = e.event.shiftKey;
    const event = e.points[0] as Readonly<PlotlyTypes.PlotSelectionEvent>['points'][number] & { fullData: { ids: string[] } };
    const xSelected = event.x as string;
    const eventIds = event.data.ids.filter((_, idx) => event.data.x[idx] === xSelected);

    // Multiselect enabled
    if (shiftPressed) {
      // Filter out incoming ids in order to deselect violin/box element
      const newSelected = selectedList.filter((s) => !eventIds.includes(s));

      // If incoming ids were not in selected already, add them
      if (newSelected.length === selectedList.length) {
        newSelected.push(...eventIds);
      }
      selectionCallback(newSelected);

      if (currentSelectedX.includes(xSelected)) {
        setCurrentSelectedX(currentSelectedX.filter((x) => x !== xSelected));
      } else {
        setCurrentSelectedX([...new Set([...currentSelectedX, xSelected])]);
      }
    }
    // Multiselect disabled
    else if (currentSelectedX.length === 1 && currentSelectedX[0] === xSelected) {
      selectionCallback([]);
      setCurrentSelectedX([]);
    } else {
      selectionCallback(eventIds);
      setCurrentSelectedX([xSelected]);
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
    if (!filteredTraces) {
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
      grid: { rows: filteredTraces.rows, columns: filteredTraces.cols, xgap: 0.3, pattern: 'independent' },
      shapes: [],
    };

    setLayout((prev) => ({ ...prev, ...beautifyLayout(filteredTraces, innerLayout, prev, true) }));
  }, [filteredTraces]);

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
      {traceStatus === 'success' && layout && filteredTraces?.plots.length > 0 ? (
        <PlotlyComponent
          divId={`plotlyDiv${id}`}
          data={[...filteredTraces.plots.map((p) => p.data), ...filteredTraces.legendPlots.map((p) => p.data)]}
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
        <InvalidCols headerMessage={filteredTraces?.errorMessageHeader} bodyMessage={traceError?.message || filteredTraces?.errorMessage} />
      ) : null}
    </Stack>
  );
}
