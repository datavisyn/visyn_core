import { Center, Group, Stack } from '@mantine/core';
import * as d3 from 'd3v7';
import uniqueId from 'lodash/uniqueId';
import { XAxisName, YAxisName } from 'plotly.js-dist-min';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useAsync } from '../../hooks';
import { PlotlyComponent } from '../../plotly';
import { Plotly } from '../../plotly/full';
import { InvalidCols } from '../general/InvalidCols';
import { beautifyLayout } from '../general/layoutUtils';
import { EScatterSelectSettings, ICommonVisProps } from '../interfaces';
import { BrushOptionButtons } from '../sidebar/BrushOptionButtons';
import { fitRegressionLine } from './Regression';
import { ELabelingOptions, ERegressionLineType, IRegressionResult, IScatterConfig } from './interfaces';
import { createScatterTraces, defaultConfig } from './utils';

const formatPValue = (pValue: number) => {
  if (!pValue) {
    return 'N/A';
  }
  if (pValue < 0.001) {
    return '<.001';
  }
  return pValue.toFixed(3).toString().replace(/^0+/, '=');
};

const annotationsForRegressionStats = (results: IRegressionResult[]) => {
  const annotations: Partial<Plotly.Annotations>[] = [];

  for (const r of results) {
    const statsFormatted = [
      `n: ${r.stats.n}`,
      `R²: ${r.stats.r2} <i>(P${formatPValue(r.stats.pValue)})</i>`,
      `Pearson: ${r.stats.pearsonRho?.toFixed(3)}`,
      `Spearman: ${r.stats.spearmanRho?.toFixed(3)}`,
    ];

    annotations.push({
      x: 0.0,
      y: 1.0,
      xref: `${r.xref} domain` as XAxisName,
      yref: `${r.yref} domain` as YAxisName,
      text: statsFormatted.map((row) => `${row}`).join('<br>'),
      showarrow: false,
      font: {
        family: 'Roboto, sans-serif',
        size: results.length > 1 ? 12 : 13.4,
        color: '#7f7f7f',
      },
      align: 'left',
      xanchor: 'left',
      yanchor: 'top',
      bgcolor: 'rgba(255, 255, 255, 0.8)',
      xshift: 10,
      yshift: -10,
    });
  }
  return annotations;
};

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
}: ICommonVisProps<IScatterConfig>) {
  const id = React.useMemo(() => uniqueId('ScatterVis'), []);

  const [layout, setLayout] = useState<Partial<Plotly.Layout>>(null);

  // TODO: This is a little bit hacky, Also notification should be shown to the user
  // Limit numerical columns to 2 if facets are enabled
  useEffect(() => {
    if (config.facets && config.numColumnsSelected.length > 2) {
      setConfig({ ...config, numColumnsSelected: config.numColumnsSelected.slice(0, 2) });
    }
  }, [config, setConfig]);

  useEffect(() => {
    const plotDiv = document.getElementById(`plotlyDiv${id}`);
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
    config.facets,
    config.shape,
    config.color,
    config.alphaSliderVal,
    config.sizeSliderVal,
    config.numColorScaleType,
    scales,
    shapes,
    config.showLabels,
  ]);

  // Regression lines for all subplots
  const regression: { shapes: Partial<Plotly.Shape>[]; results: IRegressionResult[] } = useMemo(() => {
    const onRegressionResultsChanged = config.regressionLineOptions?.setRegressionResults || (() => null);
    if (traces?.plots && config.regressionLineOptions.type !== ERegressionLineType.NONE) {
      const regressionShapes: Partial<Plotly.Shape>[] = [];
      const regressionResults: IRegressionResult[] = [];
      for (const plot of traces.plots) {
        if (plot.data.type === 'scattergl') {
          const curveFit = fitRegressionLine(plot.data, config.regressionLineOptions.type, config.regressionLineOptions.fitOptions);
          regressionShapes.push({
            type: 'path',
            path: curveFit.svgPath,
            line: { ...defaultConfig.regressionLineOptions.lineStyle, ...config.regressionLineOptions.lineStyle },
            xref: curveFit.xref as Plotly.XAxisName,
            yref: curveFit.yref as Plotly.YAxisName,
          });
          regressionResults.push(curveFit);
        }
      }

      onRegressionResultsChanged(regressionResults);
      return { shapes: regressionShapes, results: regressionResults };
    }

    return { shapes: [], results: [] };
  }, [traces?.plots, config]);

  // Plot annotations
  const annotations: Partial<Plotly.Annotations>[] = useMemo(() => {
    const combinedAnnotations = [];
    if (traces && traces.plots) {
      if (config.facets) {
        traces.plots.map((p) =>
          combinedAnnotations.push({
            x: 0.5,
            y: 1,
            yshift: 5,
            xref: `${p.data.xaxis} domain` as Plotly.XAxisName,
            yref: `${p.data.yaxis} domain` as Plotly.YAxisName,
            xanchor: 'center',
            yanchor: 'bottom',
            text: p.title,
            showarrow: false,
            font: {
              size: 16,
              color: '#7f7f7f',
            },
          }),
        );
      }

      if (config.regressionLineOptions.showStats) {
        combinedAnnotations.push(...annotationsForRegressionStats(regression.results));
      }
    }

    return combinedAnnotations;
  }, [config.facets, config.regressionLineOptions?.showStats, regression.results, traces]);

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
        size: 13.4,
      },
      margin: {
        t: showDragModeOptions ? (config.facets ? 30 : 25) : 50,
        r: 25,
        l: 50,
        b: 50,
      },
      shapes: [],
      grid: { rows: traces.rows, columns: traces.cols, xgap: 0.3, pattern: 'independent' },
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

          if (selectedList.length > 0) {
            selectedList.forEach((selectedId) => {
              temp.push(p.data.ids.indexOf(selectedId));
            });
          } else if (config.color && selectedList.length === 0) {
            temp.push(...Array.from({ length: p.data.ids.length }, (_, i) => i));
          }

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
  }, [traces, selectedList, config.color, config.showLabels, config.alphaSliderVal]);

  const plotlyData = useMemo(() => {
    if (traces) {
      return [...plotsWithSelectedPoints.map((p) => p.data), ...traces.legendPlots.map((p) => p.data)];
    }

    return [];
  }, [plotsWithSelectedPoints, traces]);

  return (
    <Stack gap={0} style={{ height: '100%', width: '100%' }}>
      {showDragModeOptions ? (
        <Center>
          <Group mt="lg">
            <BrushOptionButtons callback={(dragMode: EScatterSelectSettings) => setConfig({ ...config, dragMode })} dragMode={config.dragMode} />
          </Group>
        </Center>
      ) : null}

      {traceStatus === 'success' && plotsWithSelectedPoints.length > 0 ? (
        <PlotlyComponent
          key={id}
          divId={`plotlyDiv${id}`}
          data={plotlyData}
          layout={{
            ...layout,
            shapes: [...(layout?.shapes || []), ...regression.shapes],
            annotations,
          }}
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
            d3.select(`#plotlyDiv${id}`).selectAll('.legend').selectAll('.traces').style('opacity', 1);
          }}
          onUpdate={() => {
            d3.select(`#plotlyDiv${id}`).selectAll('.legend').selectAll('.traces').style('opacity', 1);
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
