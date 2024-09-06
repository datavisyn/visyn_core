import { Center, Group, Stack, Switch, Tooltip } from '@mantine/core';
import { useShallowEffect, useUncontrolled } from '@mantine/hooks';
import * as d3 from 'd3v7';
import uniqueId from 'lodash/uniqueId';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useAsync } from '../../hooks';
import { PlotlyComponent, PlotlyTypes } from '../../plotly';
import { DownloadPlotButton } from '../general/DownloadPlotButton';
import { InvalidCols } from '../general/InvalidCols';
import { VIS_TRACES_COLOR } from '../general/constants';
import { beautifyLayout } from '../general/layoutUtils';
import { EScatterSelectSettings, ICommonVisProps } from '../interfaces';
import { BrushOptionButtons } from '../sidebar/BrushOptionButtons';
import { fitRegressionLine } from './Regression';
import { ELabelingOptions, ERegressionLineType, IInternalScatterConfig, IRegressionResult } from './interfaces';
import { createScatterTraces, defaultRegressionLineStyle } from './utils';

const formatPValue = (pValue: number) => {
  if (pValue === null) {
    return '';
  }
  if (pValue < 0.001) {
    return `<i>(P<.001)</i>`;
  }
  return `<i>(P=${pValue.toFixed(3).toString().replace(/^0+/, '')})</i>`;
};

const annotationsForRegressionStats = (results: IRegressionResult[], precision: number) => {
  const annotations: Partial<PlotlyTypes.Annotations>[] = [];

  for (const r of results) {
    const statsFormatted = [
      `n: ${r.stats.n}`,
      `R²: ${r.stats.r2 < 0.001 ? '<0.001' : r.stats.r2} ${formatPValue(r.stats.pValue)}`,
      `Pearson: ${r.stats.pearsonRho?.toFixed(precision)}`,
      `Spearman: ${r.stats.spearmanRho?.toFixed(precision)}`,
    ];

    annotations.push({
      x: 0.0,
      y: 1.0,
      xref: `${r.xref} domain` as PlotlyTypes.XAxisName,
      yref: `${r.yref} domain` as PlotlyTypes.YAxisName,
      text: statsFormatted.map((row) => `${row}`).join('<br>'),
      showarrow: false,
      font: {
        family: 'Roboto, sans-serif',
        size: results.length > 1 ? 12 : 13.4,
        color: '#99A1A9',
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
  stats,
  statsCallback = () => null,
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
}: ICommonVisProps<IInternalScatterConfig>) {
  const id = React.useMemo(() => uniquePlotId || uniqueId('ScatterVis'), [uniquePlotId]);
  const [showLegend, setShowLegend] = useUncontrolled({
    defaultValue: true,
    value: config.showLegend,
  });
  const [layout, setLayout] = useState<Partial<PlotlyTypes.Layout>>(null);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);

  // TODO: This is a little bit hacky, Also notification should be shown to the user
  // Limit numerical columns to 2 if facets are enabled
  useEffect(() => {
    if (config.facets && config.numColumnsSelected.length > 2) {
      setConfig({ ...config, numColumnsSelected: config.numColumnsSelected.slice(0, 2) });
    }
  }, [config, setConfig]);

  useEffect(() => {
    const plotDiv = document.getElementById(`${id}`);
    if (plotDiv) {
      import('plotly.js-dist-min').then((Plotly) => {
        Plotly.Plots.resize(plotDiv);
      });
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
    config.labelColumns,
    config.facets,
    config.shape,
    config.color,
    config.alphaSliderVal,
    config.sizeSliderVal,
    config.numColorScaleType,
    scales,
    shapes,
    config.showLabels,
    config.showLabelLimit,
    selectedMap,
  ]);

  const lineStyleToPlotlyShapeLine = (lineStyle: { colors: string[]; colorSelected: number; width: number; dash: PlotlyTypes.Dash }) => {
    return {
      color: lineStyle.colors[lineStyle.colorSelected],
      width: lineStyle.width,
      dash: lineStyle.dash,
    };
  };

  // Regression lines for all subplots
  const regression: { shapes: Partial<PlotlyTypes.Shape>[]; results: IRegressionResult[] } = useMemo(() => {
    if (traces?.plots) {
      statsCallback(null);
      if (config.regressionLineOptions?.type && config.regressionLineOptions.type !== ERegressionLineType.NONE) {
        const regressionShapes: Partial<PlotlyTypes.Shape>[] = [];
        const regressionResults: IRegressionResult[] = [];
        for (const plot of traces.plots) {
          if (plot.data.type === 'scattergl') {
            const curveFit = fitRegressionLine(plot.data, config.regressionLineOptions.type, config.regressionLineOptions.fitOptions);
            if (!curveFit.svgPath.includes('NaN')) {
              regressionShapes.push({
                type: 'path',
                path: curveFit.svgPath,
                line: lineStyleToPlotlyShapeLine({ ...defaultRegressionLineStyle, ...config.regressionLineOptions.lineStyle }),
                xref: curveFit.xref as PlotlyTypes.XAxisName,
                yref: curveFit.yref as PlotlyTypes.YAxisName,
              });
            }
            regressionResults.push(curveFit);
          }
        }

        // If we only have one subplot set the stats directly and not on hover
        if (regressionResults.length === 1) {
          statsCallback(regressionResults[0].stats);
        }
        return { shapes: regressionShapes, results: regressionResults };
      }
    }
    return { shapes: [], results: [] };
  }, [traces?.plots, config, statsCallback]);

  // Plot annotations
  const annotations: Partial<PlotlyTypes.Annotations>[] = useMemo(() => {
    const combinedAnnotations = [];
    if (traces && traces.plots) {
      if (config.facets) {
        traces.plots.map((p) =>
          combinedAnnotations.push({
            x: 0.5,
            y: 1,
            yshift: 5,
            xref: `${p.data.xaxis} domain` as PlotlyTypes.XAxisName,
            yref: `${p.data.yaxis} domain` as PlotlyTypes.YAxisName,
            xanchor: 'center',
            yanchor: 'bottom',
            text: p.title,
            showarrow: false,
            font: {
              size: 16,
              color: VIS_TRACES_COLOR,
            },
          }),
        );
      }

      if (config.regressionLineOptions?.showStats) {
        combinedAnnotations.push(...annotationsForRegressionStats(regression.results, config.regressionLineOptions.fitOptions?.precision || 3));
      }
    }

    return combinedAnnotations;
  }, [config.facets, config.regressionLineOptions, regression.results, traces]);

  React.useEffect(() => {
    if (!traces) {
      return;
    }

    const innerLayout: Partial<PlotlyTypes.Layout> = {
      hovermode: 'closest',
      showlegend: showLegend,
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
        t: showDragModeOptions ? (config.facets ? 40 : 25) : config.facets ? 65 : 50,
        r: 25,
        l: 50,
        b: 50,
      },
      shapes: [],
      grid: { rows: traces.rows, columns: traces.cols, xgap: 0.15, ygap: config.facets ? 0.2 : 0.15, pattern: 'independent' },
      dragmode: config.dragMode,
    };

    setLayout((previous) => ({ ...previous, ...beautifyLayout(traces, innerLayout, previous, null, false) }));
  }, [traces, config.dragMode, showLegend, showDragModeOptions, config.facets]);

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
    let data = [];
    if (plotsWithSelectedPoints) {
      data = [...plotsWithSelectedPoints.map((p) => p.data)];
    }
    if (traces) {
      data = [...data, ...traces.legendPlots.map((p) => p.data)];
    }

    return data.map((d) => {
      const textIndices = !config.showLabelLimit ? (d.selectedpoints ?? []) : (d.selectedpoints ?? []).slice(0, config.showLabelLimit);
      const text = config.showLabels === ELabelingOptions.ALWAYS ? d.text : isSelecting ? '' : (d.text ?? []).map((t, i) => (textIndices.includes(i) ? t : ''));

      return { ...d, text };
    });
  }, [config.showLabelLimit, config.showLabels, isSelecting, plotsWithSelectedPoints, traces]);

  useShallowEffect(() => {
    setConfig({ ...config, selectedPointsCount: selectedList.length });
  }, [selectedList, setConfig]);

  return (
    <Stack gap={0} style={{ height: '100%', width: '100%' }} pos="relative">
      {showDragModeOptions || showDownloadScreenshot ? (
        <Center>
          <Group>
            {showDragModeOptions ? (
              <BrushOptionButtons callback={(dragMode: EScatterSelectSettings) => setConfig({ ...config, dragMode })} dragMode={config.dragMode} />
            ) : null}
            {showDownloadScreenshot && plotsWithSelectedPoints.length > 0 ? <DownloadPlotButton uniquePlotId={id} config={config} /> : null}
          </Group>
        </Center>
      ) : null}
      {traceStatus === 'success' && plotsWithSelectedPoints.length > 0 ? (
        <>
          {config.showLegend === undefined ? (
            <Tooltip label="Toggle legend" refProp="rootRef">
              <Switch
                styles={{ label: { paddingLeft: '5px' } }}
                size="xs"
                disabled={traces.legendPlots.length === 0}
                style={{ position: 'absolute', right: 42, top: 18, zIndex: 99 }}
                defaultChecked
                label="Legend"
                onChange={() => setShowLegend(!showLegend)}
                checked={showLegend}
              />
            </Tooltip>
          ) : null}
          <PlotlyComponent
            data-testid="ScatterPlotTestId"
            key={id}
            divId={id}
            data={plotlyData}
            layout={{
              ...layout,
              shapes: [...(layout?.shapes || []), ...regression.shapes],
              annotations,
            }}
            onHover={(event) => {
              // If we have subplots we set the stats for the current subplot on hover
              // It is up to the application to decide how to display the stats
              if (config.regressionLineOptions?.type && config.regressionLineOptions.type !== ERegressionLineType.NONE && regression.results.length > 1) {
                let result: IRegressionResult = null;
                if (regression.results.length > 0) {
                  const xAxis = event.points[0].yaxis.anchor;
                  const yAxis = event.points[0].xaxis.anchor;
                  result = regression.results.find((r) => r.xref === xAxis && r.yref === yAxis) || null;
                }
                statsCallback(result?.stats);
              }
            }}
            onUnhover={() => {
              // If we have subplots we clear the current stats when the mouse leaves the plot
              if (config.regressionLineOptions?.type && config.regressionLineOptions.type !== ERegressionLineType.NONE && regression.results.length > 1) {
                statsCallback(null);
              }
            }}
            config={{ responsive: true, displayModeBar: false, scrollZoom }}
            useResizeHandler
            style={{ width: '100%', height: '100%' }}
            onClick={(event) => {
              // @ts-ignore
              if (event.points[0]?.binNumber !== undefined) {
                // @ts-ignore
                const selInidices = event.points?.map((d) => d?.pointIndices).flat(1);
                const indices = event.points[0]?.data?.customdata?.filter((_, i) => selInidices.includes(i)) as string[];
                selectionCallback(indices);
              } else {
                const clickedId = (event.points[0] as any).id;
                if (selectedMap[clickedId]) {
                  selectionCallback(selectedList.filter((s) => s !== clickedId));
                } else {
                  selectionCallback([...selectedList, clickedId]);
                }
              }
            }}
            onLegendClick={() => false}
            onDoubleClick={() => {
              selectionCallback([]);
            }}
            onInitialized={() => {
              d3.select(id).selectAll('.legend').selectAll('.traces').style('opacity', 1);
            }}
            onUpdate={() => {
              d3.select(id).selectAll('.legend').selectAll('.traces').style('opacity', 1);
              window.addEventListener('keydown', (event) => {
                if (event.key === 'Shift') {
                  setIsShiftPressed(true);
                }
              });
              window.addEventListener('keyup', (event) => {
                if (event.key === 'Shift') {
                  setIsShiftPressed(false);
                }
              });
            }}
            onSelecting={() => {
              setIsSelecting(true);
            }}
            onSelected={(sel) => {
              if (sel) {
                let indices = [];
                // @ts-ignore
                if (sel.points[0]?.binNumber !== undefined) {
                  // @ts-ignore
                  const selInidices = sel.points?.map((d) => d?.pointIndices).flat(1);
                  indices = sel.points[0]?.data?.customdata?.filter((_, i) => selInidices.includes(i)) as string[];
                } else {
                  indices = sel.points?.map((d) => (d as any).id);
                }
                const selected = Array.from(new Set(isShiftPressed ? [...selectedList, ...indices] : indices));
                selectionCallback(selected);
                setIsSelecting(false);
                setConfig({ ...config, selectedPointsCount: selected.length });
              }
            }}
          />
        </>
      ) : traceStatus !== 'pending' && traceStatus !== 'idle' ? (
        <InvalidCols headerMessage={traces?.errorMessageHeader} bodyMessage={traceError?.message || traces?.errorMessage} />
      ) : null}
    </Stack>
  );
}
