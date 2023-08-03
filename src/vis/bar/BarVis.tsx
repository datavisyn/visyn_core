import * as React from 'react';
import * as d3v7 from 'd3v7';
import uniqueId from 'lodash/uniqueId';
import difference from 'lodash/difference';
import { useEffect, useMemo, useState } from 'react';
import { Stack } from '@mantine/core';
import { IBarConfig, EBarGroupingType, ICommonVisProps } from '../interfaces';
import { PlotlyComponent } from '../../plotly';
import { Plotly } from '../../plotly/full';
import { InvalidCols } from '../general';
import { beautifyLayout } from '../general/layoutUtils';
import { useAsync } from '../../hooks';
import { createBarTraces } from './utils';

export function BarVis({
  config,
  columns,
  scales,
  selectionCallback = () => null,
  selectedMap = {},
  selectedList = [],
  dimensions,
}: ICommonVisProps<IBarConfig>) {
  const { value: traces, status: traceStatus, error: traceError } = useAsync(createBarTraces, [columns, config, scales]);

  const [layout, setLayout] = useState<Partial<Plotly.Layout>>(null);

  // Make sure selected values is right for each plot.
  const finalTraces = useMemo(() => {
    if (!traces) {
      return null;
    }

    let isTraceSelected = false;

    const editedTraces = { ...traces };

    editedTraces?.plots.forEach((plot) => {
      // custom data on each trace is the ids of every element in that section of the bar.
      const tracePoints: string[][] = plot.data.customdata as string[][];

      const selectedIndices = [];
      tracePoints.forEach((points, index) => {
        if (points.length === 0) {
          return;
        }
        for (const point of points) {
          if (selectedMap[point]) {
            isTraceSelected = true;
            selectedIndices.push(index);
          }
        }
      });

      if (selectedIndices.length > 0) {
        plot.data.selectedpoints = selectedIndices;
      } else {
        plot.data.selectedpoints = null;
      }
    });

    if (isTraceSelected) {
      editedTraces?.plots.forEach((plot) => {
        if (plot.data.selectedpoints === null) {
          plot.data.selectedpoints = [];
        }
      });
    }

    return editedTraces;
  }, [traces, selectedMap]);

  const id = React.useMemo(() => uniqueId('BarVis'), []);

  useEffect(() => {
    const plotDiv = document.getElementById(`plotlyDiv${id}`);
    if (plotDiv) {
      Plotly.Plots.resize(plotDiv);
    }
  }, [id, dimensions]);

  React.useEffect(() => {
    if (!finalTraces) {
      return;
    }

    const innerLayout: Partial<Plotly.Layout> = {
      showlegend: true,
      legend: {
        // @ts-ignore
        itemclick: false,
        itemdoubleclick: false,
      },
      font: {
        family: 'Roboto, sans-serif',
      },
      margin: {
        t: 40,
        r: 25,
        l: 25,
        b: 25,
      },
      autosize: true,
      grid: { rows: finalTraces.rows, columns: finalTraces.cols, xgap: 0.3, pattern: 'independent' },
      shapes: [],
      barmode: config.groupType === EBarGroupingType.STACK ? 'stack' : 'group',
      dragmode: false,
    };

    setLayout({ ...layout, ...beautifyLayout(finalTraces, innerLayout, null, true) });
    // WARNING: Do not update when layout changes, that would be an infinite loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalTraces, config.groupType]);

  const traceData = useMemo(() => {
    if (!finalTraces) {
      return null;
    }

    return [...finalTraces.plots.map((p) => p.data), ...finalTraces.legendPlots.map((p) => p.data)];
  }, [finalTraces]);

  return (
    <Stack
      spacing={0}
      sx={{
        flexGrow: 1,
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {traceStatus === 'success' && layout && finalTraces?.plots.length > 0 ? (
        <PlotlyComponent
          divId={`plotlyDiv${id}`}
          data={traceData}
          layout={layout}
          config={{ responsive: true, displayModeBar: false }}
          useResizeHandler
          style={{ width: '100%', height: '100%' }}
          onClick={(e) => {
            // plotly types here are just wrong. So have to convert to unknown first.
            const selectedPoints: string[] = e.points[0].customdata as unknown as string[];

            let removeSelectionFlag = false;

            if (selectedPoints.length === selectedList.length) {
              removeSelectionFlag = true;

              for (const pointId of selectedPoints) {
                if (!selectedMap[pointId]) {
                  removeSelectionFlag = false;
                  break;
                }
              }
            }

            if (removeSelectionFlag) {
              const newList = difference(selectedList, selectedPoints);
              selectionCallback(newList);
            } else if (e.event.ctrlKey) {
              const newList = Array.from(new Set([...selectedList, ...selectedPoints]));
              selectionCallback(newList);
            } else {
              selectionCallback(selectedPoints);
            }
          }}
          // plotly redraws everything on updates, so you need to reappend title and
          onUpdate={() => {
            for (const p of finalTraces.plots) {
              d3v7.select(`g .${p.data.xaxis}title`).style('pointer-events', 'all').append('title').text(p.xLabel);

              d3v7.select(`g .${p.data.yaxis}title`).style('pointer-events', 'all').append('title').text(p.yLabel);
            }
          }}
        />
      ) : traceStatus !== 'pending' && traceStatus !== 'idle' && layout ? (
        <InvalidCols headerMessage={finalTraces?.errorMessageHeader} bodyMessage={traceError?.message || finalTraces?.errorMessage} />
      ) : null}
    </Stack>
  );
}
