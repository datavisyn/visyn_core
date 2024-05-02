import { Center, Group, Stack } from '@mantine/core';
import * as d3 from 'd3v7';
import uniqueId from 'lodash/uniqueId';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useAsync } from '../../hooks';
import { PlotlyComponent } from '../../plotly';
import { Plotly } from '../../plotly/full';
import { InvalidCols } from '../general/InvalidCols';
import { beautifyLayout } from '../general/layoutUtils';
import { EScatterSelectSettings, ICommonVisProps } from '../interfaces';
import { BrushOptionButtons } from '../sidebar/BrushOptionButtons';
import { createScatterTraces } from './utils';
import { ELabelingOptions, IScatterConfig } from './interfaces';
import { DownloadPlotButton } from '../general/DownloadPlotButton';

export function ScatterVis({
  config,
  columns,
  shapes = ['circle', 'square', 'triangle-up', 'star'],
  selectionCallback = () => null,
  selectedMap = {},
  selectedList = [],
  setConfig,
  dimensions,
  showDragModeOptions,
  scales,
  scrollZoom,
  uniquePlotId,
  showDownloadScreenshot,
}: ICommonVisProps<IScatterConfig>) {
  const id = React.useMemo(() => uniquePlotId || uniqueId('ScatterVis'), [uniquePlotId]);

  const [layout, setLayout] = useState<Partial<Plotly.Layout>>(null);

  useEffect(() => {
    const plotDiv = document.getElementById(`${id}`);
    if (plotDiv) {
      Plotly.Plots.resize(plotDiv);
    }
  }, [id, dimensions]);

  useEffect(() => {
    setLayout(null);
  }, [config.numColumnsSelected.length]);

  const {
    value: traces,
    status: traceStatus,
    error: traceError,
  } = useAsync(createScatterTraces, [
    columns,
    config.numColumnsSelected,
    config.shape,
    config.color,
    config.alphaSliderVal,
    config.sizeSliderVal,
    config.numColorScaleType,
    scales,
    shapes,
    config.showLabels,
  ]);

  React.useEffect(() => {
    if (!traces) {
      return;
    }

    const innerLayout: Partial<Plotly.Layout> = {
      showlegend: true,
      legend: {
        // @ts-ignore
        itemclick: false,
        itemdoubleclick: false,
        font: {
          // same as default label font size in the sidebar
          size: 13.4,
        },
      },
      font: {
        family: 'Roboto, sans-serif',
      },
      margin: {
        t: showDragModeOptions ? 25 : 50,
        r: 25,
        l: 100,
        b: 100,
      },
      grid: { rows: traces.rows, columns: traces.cols, xgap: 0.3, pattern: 'independent' },
      shapes: [],
      dragmode: config.dragMode,
    };

    setLayout({ ...layout, ...beautifyLayout(traces, innerLayout, layout, false) });
    // WARNING: Do not update when layout changes, that would be an infinite loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [traces, config.dragMode]);

  const plotsWithSelectedPoints = useMemo(() => {
    if (traces) {
      const allPlots = traces.plots;
      allPlots
        .filter((trace) => trace.data.type === 'scattergl')
        .forEach((p) => {
          const temp = [];

          (p.data.ids as any).forEach((currId, index) => {
            if (selectedMap[currId] || (selectedList.length === 0 && config.color)) {
              temp.push(index);
            }
          });

          p.data.selectedpoints = temp;
          // @ts-ignore
          if (p.data?.selected?.textfont) {
            if (selectedList.length === 0 && config.showLabels === ELabelingOptions.SELECTED) {
              // @ts-ignore
              p.data.selected.textfont.color = `rgba(102, 102, 102, 0)`;
            } else if (selectedList.length === 0 && config.showLabels === ELabelingOptions.ALWAYS) {
              // @ts-ignore
              p.data.selected.textfont.color = `rgba(102, 102, 102, ${config.alphaSliderVal})`;
            } else {
              // @ts-ignore
              p.data.selected.textfont.color = `rgba(102, 102, 102, 1)`;
            }
          }

          if (selectedList.length === 0 && config.color) {
            // @ts-ignore
            p.data.selected.marker.opacity = config.alphaSliderVal;
          } else {
            // @ts-ignore
            p.data.selected.marker.opacity = 1;
          }
        });

      return allPlots;
    }

    return [];
  }, [traces, selectedList.length, config.showLabels, config.color, config.alphaSliderVal, selectedMap]);

  const plotlyData = useMemo(() => {
    if (traces) {
      return [...plotsWithSelectedPoints.map((p) => p.data), ...traces.legendPlots.map((p) => p.data)];
    }

    return [];
  }, [plotsWithSelectedPoints, traces]);
  return (
    <Stack gap={0} style={{ height: '100%', width: '100%' }}>
      {showDragModeOptions || showDownloadScreenshot ? (
        <Center>
          <Group>
            {showDragModeOptions ? (
              <BrushOptionButtons callback={(dragMode: EScatterSelectSettings) => setConfig({ ...config, dragMode })} dragMode={config.dragMode} />
            ) : null}
            {showDownloadScreenshot ? <DownloadPlotButton uniquePlotId={id} config={config} /> : null}
          </Group>
        </Center>
      ) : null}

      {traceStatus === 'success' && plotsWithSelectedPoints.length > 0 ? (
        <PlotlyComponent
          key={id}
          divId={id}
          data={plotlyData}
          layout={layout}
          config={{ responsive: true, displayModeBar: false, scrollZoom }}
          useResizeHandler
          style={{ width: '100%', height: '100%' }}
          onClick={(event) => {
            const clickedId = (event.points[0] as any).id;
            if (selectedMap[clickedId]) {
              selectionCallback(selectedList.filter((s) => s !== clickedId));
            } else {
              selectionCallback([...selectedList, clickedId]);
            }
          }}
          onInitialized={() => {
            d3.select(id).selectAll('.legend').selectAll('.traces').style('opacity', 1);
          }}
          onUpdate={() => {
            d3.select(id).selectAll('.legend').selectAll('.traces').style('opacity', 1);
          }}
          onSelected={(sel) => {
            selectionCallback(sel ? sel.points.map((d) => (d as any).id) : []);
          }}
        />
      ) : traceStatus !== 'pending' && traceStatus !== 'idle' ? (
        <InvalidCols headerMessage={traces?.errorMessageHeader} bodyMessage={traceError?.message || traces?.errorMessage} />
      ) : null}
    </Stack>
  );
}
