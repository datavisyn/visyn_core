/* eslint-disable react-compiler/react-compiler */
import { useWindowEvent } from '@mantine/hooks';
import { Center, Group, Stack, Switch, Tooltip } from '@mantine/core';
import * as React from 'react';
import clamp from 'lodash/clamp';
import isEmpty from 'lodash/isEmpty';
import cloneDeep from 'lodash/cloneDeep';
import { useAsync } from '../../hooks';
import { PlotlyComponent, PlotlyTypes } from '../../plotly';
import { DownloadPlotButton } from '../general/DownloadPlotButton';
import { VIS_NEUTRAL_COLOR, VIS_TRACES_COLOR } from '../general/constants';
import { EColumnTypes, EScatterSelectSettings, ICommonVisProps } from '../interfaces';
import { BrushOptionButtons } from '../sidebar/BrushOptionButtons';
import { ELabelingOptions, ERegressionLineType, IInternalScatterConfig, IRegressionResult } from './interfaces';
import { defaultRegressionLineStyle, fetchColumnData, regressionToAnnotation } from './utils';
import { getLabelOrUnknown } from '../general/utils';
import { columnNameWithDescription, truncateText } from '../general/layoutUtils';
import { fitRegressionLine } from './Regression';
import { useDataPreparation } from './useDataPreparation';
import { InvalidCols } from '../general/InvalidCols';
import { i18n } from '../../i18n/I18nextManager';

// d3v7.forc

const BASE_LAYOUT: Partial<PlotlyTypes.Layout> = {
  hovermode: 'closest',
  hoverlabel: {
    align: 'left',
  },
  margin: { l: 50, r: 50, b: 50, t: 50, pad: 4 },
};

const textPositionOptions = ['top center', 'bottom center'];

const BASE_DATA: Partial<PlotlyTypes.Data> = {
  showlegend: false,
  hoverinfo: 'x+y+text',
};

const lineStyleToPlotlyShapeLine = (lineStyle: { colors: string[]; colorSelected: number; width: number; dash: PlotlyTypes.Dash }) => {
  return {
    color: lineStyle.colors[lineStyle.colorSelected],
    width: lineStyle.width,
    dash: lineStyle.dash,
  };
};

const AXIS_TICK_STYLES: Partial<PlotlyTypes.Layout['xaxis']> = {
  tickfont: {
    color: VIS_NEUTRAL_COLOR,
  },
  title: {
    font: {
      size: 12,
      color: VIS_NEUTRAL_COLOR,
    },
  },
  zeroline: false,
};

function baseData(alpha: number): Partial<PlotlyTypes.Data> {
  return {
    selected: {
      textfont: {
        color: VIS_NEUTRAL_COLOR,
      },
      marker: {
        opacity: 1,
        // color: selectionColorDark,
      },
    },
    unselected: {
      textfont: {
        color: VIS_NEUTRAL_COLOR,
      },
      marker: {
        color: VIS_NEUTRAL_COLOR,
        opacity: Math.min(alpha, 0.2),
      },
    },
  };
}

export function ScatterVisNew({
  config,
  columns,
  shapes: uniqueSymbols = ['circle', 'square', 'triangle-up', 'star'],
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
  const id = `ScatterVis_${React.useId()}`;

  const [shiftPressed, setShiftPressed] = React.useState(false);
  const [showLegend, setShowLegend] = React.useState(false);

  useWindowEvent('keydown', (event) => {
    if (event.shiftKey) {
      setShiftPressed(true);
    }
  });

  useWindowEvent('keyup', (event) => {
    if (!event.shiftKey) {
      setShiftPressed(false);
    }
  });

  // Base data to work on
  const { value, status, args, error } = useAsync(fetchColumnData, [
    columns,
    config.numColumnsSelected,
    config.labelColumns,
    config.color,
    config.shape,
    config.facets,
  ]);

  // Ref to previous arguments for useAsync
  const previousArgs = React.useRef<typeof args>(args);

  // Plotlys internal layout state
  const internalLayoutRef = React.useRef<Partial<PlotlyTypes.Layout>>({});

  // If the useAsync arguments change, clear the internal layout state.
  // Why not just use the config to compare things?
  // Because the useAsync takes one render cycle to update the value, and inbetween that, plotly has already updated the internalLayoutRef again with the old one.
  if (args?.[1] !== previousArgs.current?.[1] || args?.[5] !== previousArgs.current?.[5]) {
    internalLayoutRef.current = {};
    previousArgs.current = args;
  }

  const { scatter, splom, facet, shapeScale, colorScale } = useDataPreparation({ value, status, uniqueSymbols, numColorScaleType: config.numColorScaleType });

  const regressions = React.useMemo<{
    results: IRegressionResult[];
    shapes: Partial<PlotlyTypes.Shape>[];
    annotations: Partial<PlotlyTypes.Annotations>[];
  }>(() => {
    if (status !== 'success' || !value || !config.regressionLineOptions?.type || config.regressionLineOptions.type === ERegressionLineType.NONE) {
      return { shapes: [], annotations: [], results: [] };
    }

    if (scatter) {
      const curveFit = fitRegressionLine(
        { x: scatter.plotlyData.x, y: scatter.plotlyData.y },
        config.regressionLineOptions.type,
        config.regressionLineOptions.fitOptions,
      );

      if (!curveFit.svgPath.includes('NaN')) {
        return {
          shapes: [
            {
              type: 'path',
              path: curveFit.svgPath,
              line: lineStyleToPlotlyShapeLine({ ...defaultRegressionLineStyle, ...config.regressionLineOptions.lineStyle }),
              xref: 'x',
              yref: 'y',
            },
          ],
          results: [curveFit],
          annotations: [regressionToAnnotation(curveFit, 3, 'x', 'y')],
        };
      }
    }

    if (facet) {
      const shapes: Partial<PlotlyTypes.Shape>[] = [];
      const annotations: Partial<PlotlyTypes.Annotations>[] = [];

      facet.resultData.forEach((group) => {
        const curveFit = fitRegressionLine({ x: group.data.x, y: group.data.y }, config.regressionLineOptions.type, config.regressionLineOptions.fitOptions);

        if (!curveFit.svgPath.includes('NaN')) {
          shapes.push({
            type: 'path',
            path: curveFit.svgPath,
            line: lineStyleToPlotlyShapeLine({ ...defaultRegressionLineStyle, ...config.regressionLineOptions.lineStyle }),
            xref: group.xref,
            yref: group.yref,
          });
        }
      });

      return { shapes, results: [], annotations };
    }

    if (splom) {
      // SPLOM case, fit a curve through each pair
      const results: IRegressionResult[] = [];
      const plotlyShapes: Partial<PlotlyTypes.Shape>[] = [];
      // eslint-disable-next-line guard-for-in
      splom.xyPairs.forEach((pair, i) => {
        const curveFit = fitRegressionLine({ x: pair.data.x, y: pair.data.y }, config.regressionLineOptions.type, config.regressionLineOptions.fitOptions);

        if (!curveFit.svgPath.includes('NaN')) {
          plotlyShapes.push({
            type: 'path',
            path: curveFit.svgPath,
            line: lineStyleToPlotlyShapeLine({ ...defaultRegressionLineStyle, ...config.regressionLineOptions.lineStyle }),
            xref: pair.xref,
            yref: pair.yref,
          });
        }
      });

      return { shapes: plotlyShapes, results, annotations: [] };
    }

    return { shapes: [], results: [], annotations: [] };
  }, [
    status,
    value,
    config.regressionLineOptions.type,
    config.regressionLineOptions.fitOptions,
    config.regressionLineOptions.lineStyle,
    scatter,
    facet,
    splom,
  ]);

  const layout = React.useMemo<Partial<PlotlyTypes.Layout>>(() => {
    if (scatter) {
      const finalLayout: Partial<PlotlyTypes.Layout> = {
        ...BASE_LAYOUT,
        xaxis: {
          ...AXIS_TICK_STYLES,
          range: scatter.xDomain,
          ...internalLayoutRef.current?.xaxis,
        },
        yaxis: {
          ...AXIS_TICK_STYLES,
          range: scatter.yDomain,
          ...internalLayoutRef.current?.yaxis,
        },
        shapes: regressions.shapes,
        annotations: [...regressions.annotations],
        dragmode: config.dragMode,
      };

      return finalLayout;
    }

    if (facet) {
      const axes: Record<string, Partial<PlotlyTypes.LayoutAxis>> = {};
      const titleAnnotations: Partial<PlotlyTypes.Annotations>[] = [];

      facet.resultData.forEach((group, plotCounter) => {
        axes[`xaxis${plotCounter > 0 ? plotCounter + 1 : ''}`] = {
          ...AXIS_TICK_STYLES,
          range: facet.xDomain,
          // Spread the previous layout to keep things like zoom
          ...(internalLayoutRef.current?.[`xaxis${plotCounter > 0 ? plotCounter + 1 : ''}` as 'xaxis'] || {}),
          // This enables axis sharing, but is really slow for some reason
          // ...(plotCounter > 0 ? { matches: 'x' } : {}),
          // @ts-ignore
          anchor: `y${plotCounter > 0 ? plotCounter + 1 : ''}`,
        };
        axes[`yaxis${plotCounter > 0 ? plotCounter + 1 : ''}`] = {
          ...AXIS_TICK_STYLES,
          range: facet.yDomain,
          // Spread the previous layout to keep things like zoom
          ...(internalLayoutRef.current?.[`yaxis${plotCounter > 0 ? plotCounter + 1 : ''}` as 'yaxis'] || {}),
          // This enables axis sharing, but is really slow for some reason
          // ...(plotCounter > 0 ? { matches: 'y' } : {}),
          // @ts-ignore
          anchor: `x${plotCounter > 0 ? plotCounter + 1 : ''}`,
        };

        titleAnnotations.push({
          x: 0.5,
          y: 1,
          yshift: -12,
          xref: `x${plotCounter > 0 ? plotCounter + 1 : ''} domain` as PlotlyTypes.XAxisName,
          yref: `y${plotCounter > 0 ? plotCounter + 1 : ''} domain` as PlotlyTypes.YAxisName,
          xanchor: 'center',
          yanchor: 'bottom',
          text: getLabelOrUnknown(group.data.facet),
          showarrow: false,
          bgcolor: '#ffffff',
          font: {
            size: 12,
            color: VIS_TRACES_COLOR,
          },
        });
      });

      const nColumns = clamp(Math.floor(dimensions.width / 400), 2, 4);
      // round up to the number of rows required, otherwise, we get chart overlap
      const nRows = Math.ceil(facet.resultData.length / nColumns);

      // if we only find one facet (e.g., the categorical column only contains one value), we don't facet
      const finalLayout: Partial<PlotlyTypes.Layout> =
        facet?.resultData.length > 1
          ? {
              ...BASE_LAYOUT,
              ...(internalLayoutRef.current || {}),
              grid: { rows: nRows, columns: nColumns, xgap: 0.2, ygap: 0.3, pattern: 'independent' },
              ...axes,
              annotations: [...titleAnnotations, ...regressions.annotations],
              shapes: regressions.shapes,
              dragmode: config!.dragMode,
            }
          : {
              ...BASE_LAYOUT,
              xaxis: {
                ...AXIS_TICK_STYLES,
                range: facet.xDomain,
                ...internalLayoutRef.current?.xaxis,
              },
              yaxis: {
                ...AXIS_TICK_STYLES,
                range: facet.yDomain,
                ...internalLayoutRef.current?.yaxis,
              },
              shapes: regressions.shapes,
              annotations: [...regressions.annotations],
              dragmode: config.dragMode,
            };

      return finalLayout;
    }

    if (splom) {
      // SPLOM case
      const axes: Record<string, PlotlyTypes.LayoutAxis> = {};

      const axis = () =>
        ({
          ...AXIS_TICK_STYLES,
        }) as PlotlyTypes.LayoutAxis;

      for (let i = 0; i < value.validColumns.length; i++) {
        axes[`xaxis${i > 0 ? i + 1 : ''}`] = axis();
        axes[`yaxis${i > 0 ? i + 1 : ''}`] = axis();
      }

      const finalLayout: Partial<PlotlyTypes.Layout> = {
        ...BASE_LAYOUT,
        ...axes,
        ...(internalLayoutRef.current || {}),
        shapes: regressions.shapes,
        dragmode: config.dragMode,
      };

      return finalLayout;
    }

    return undefined;
  }, [scatter, facet, splom, regressions.shapes, regressions.annotations, config, dimensions.width, value]);

  const legendData = React.useMemo<PlotlyTypes.Data[]>(() => {
    if (!value) {
      return [];
    }

    const legendPlots: PlotlyTypes.Data[] = [];

    if (value.shapeColumn) {
      legendPlots.push({
        x: [null],
        y: [null],
        type: 'scatter',
        mode: 'markers',
        showlegend: true,
        legendgroup: 'shape',
        hoverinfo: 'all',

        hoverlabel: {
          namelength: 10,
          bgcolor: 'black',
          align: 'left',
          bordercolor: 'black',
        },
        // @ts-ignore
        legendgrouptitle: {
          text: truncateText(value.shapeColumn.info.name, true, 20),
        },
        marker: {
          line: {
            width: 0,
          },
          symbol: value.shapeColumn ? value.shapeColumn.resolvedValues.map((v) => shapeScale(v.val as string)) : 'circle',
          color: VIS_NEUTRAL_COLOR,
        },
        transforms: [
          {
            type: 'groupby',
            groups: value.shapeColumn.resolvedValues.map((v) => getLabelOrUnknown(v.val)),
            styles: [
              ...[...new Set<string>(value.shapeColumn.resolvedValues.map((v) => getLabelOrUnknown(v.val)))].map((c) => {
                return { target: c, value: { name: c } };
              }),
            ],
          },
        ],
      });
    }

    if (value.colorColumn && value.colorColumn.type === EColumnTypes.CATEGORICAL) {
      legendPlots.push({
        x: [null],
        y: [null],
        type: 'scatter',
        mode: 'markers',
        legendgroup: 'color',
        hoverinfo: 'skip',

        // @ts-ignore
        legendgrouptitle: {
          text: truncateText(value.colorColumn.info.name, true, 20),
        },
        marker: {
          line: {
            width: 0,
          },
          symbol: 'circle',
          color: value.colorColumn
            ? value.colorColumn.resolvedValues.map((v) => (value.colorColumn.color ? value.colorColumn.color[v.val] : scales.color(v.val)))
            : VIS_NEUTRAL_COLOR,
        },
        transforms: [
          {
            type: 'groupby',
            groups: value.colorColumn.resolvedValues.map((v) => getLabelOrUnknown(v.val)),
            styles: [
              ...[...new Set<string>(value.colorColumn.resolvedValues.map((v) => getLabelOrUnknown(v.val)))].map((c) => {
                return { target: c, value: { name: c } };
              }),
            ],
          },
        ],
      });
    }

    return legendPlots;
  }, [value, shapeScale, scales]);

  const data = React.useMemo<PlotlyTypes.Data[]>(() => {
    if (status !== 'success' || !value) {
      return [];
    }

    if (scatter && config && value && value.validColumns[0]) {
      const traces = [
        {
          ...BASE_DATA,
          type: 'scattergl',
          x: scatter.plotlyData.x,
          y: scatter.plotlyData.y,
          // text: scatter.plotlyData.text,
          textposition: scatter.plotlyData.text.map((_, i) => textPositionOptions[i % textPositionOptions.length]),
          ...(isEmpty(selectedList) ? {} : { selectedpoints: selectedList.map((idx) => scatter.idToIndex.get(idx)) }),
          mode: config.showLabels === ELabelingOptions.NEVER ? 'markers' : 'text+markers',
          ...(config.showLabels === ELabelingOptions.NEVER
            ? {}
            : config.showLabels === ELabelingOptions.ALWAYS
              ? {
                  text: scatter.plotlyData.text.map((t) => truncateText(value.idToLabelMapper(t), true, 10)),
                  // textposition: 'top center',
                }
              : {
                  text: scatter.plotlyData.text.map((t, i) => (selectedList.includes(scatter.ids[i]) ? truncateText(value.idToLabelMapper(t), true, 10) : '')),
                  // textposition: 'top center',
                }),
          hovertext: value.validColumns[0].resolvedValues.map((v, i) =>
            `${value.idToLabelMapper(v.id)}
  ${(value.resolvedLabelColumns ?? []).map((l) => `<br />${columnNameWithDescription(l.info)}: ${getLabelOrUnknown(l.resolvedValues[i].val)}`)}
  ${value.colorColumn ? `<br />${columnNameWithDescription(value.colorColumn.info)}: ${getLabelOrUnknown(value.colorColumn.resolvedValues[i].val)}` : ''}
  ${value.shapeColumn && value.shapeColumn.info.id !== value.colorColumn?.info.id ? `<br />${columnNameWithDescription(value.shapeColumn.info)}: ${getLabelOrUnknown(value.shapeColumn.resolvedValues[i].val)}` : ''}`.trim(),
          ),
          marker: {
            textfont: {
              color: VIS_NEUTRAL_COLOR,
            },
            color: value.colorColumn
              ? value.colorColumn.resolvedValues.map((v) =>
                  value.colorColumn.type === EColumnTypes.NUMERICAL
                    ? colorScale(v.val as number)
                    : value.colorColumn.color
                      ? value.colorColumn.color[v.val]
                      : scales.color(v.val),
                )
              : VIS_NEUTRAL_COLOR,
            symbol: value.shapeColumn ? value.shapeColumn.resolvedValues.map((v) => shapeScale(v.val as string)) : 'circle',
            opacity: config.alphaSliderVal,
          },
          ...baseData(config.alphaSliderVal),
        } as PlotlyTypes.Data,
      ];

      if (showLegend) {
        traces.push(...legendData);
      }

      return traces;
    }

    if (facet && config && value && value.validColumns[0] && value.validColumns[1]) {
      const plots = facet.resultData.map((group) => {
        return {
          ...BASE_DATA,
          type: 'scattergl',
          x: group.data.x,
          y: group.data.y,
          xaxis: group.xref,
          yaxis: group.yref,
          mode: config.showLabels === ELabelingOptions.NEVER ? 'markers' : 'text+markers',
          textposition: group.data.text.map((_, i) => textPositionOptions[i % textPositionOptions.length]),
          ...(config.showLabels === ELabelingOptions.NEVER
            ? {}
            : config.showLabels === ELabelingOptions.ALWAYS
              ? {
                  text: group.data.text.map((t) => truncateText(value.idToLabelMapper(t), true, 10)),
                  // textposition: 'top center',
                }
              : {
                  text: group.data.text.map((t, i) => (selectedList.includes(group.data.ids[i]!) ? truncateText(value.idToLabelMapper(t), true, 10) : '')),
                  // textposition: 'top center',
                }),
          name: getLabelOrUnknown(group.data.facet),
          ...(isEmpty(selectedList) ? {} : { selectedpoints: selectedList.map((idx) => group.idToIndex.get(idx)).filter((v) => v !== undefined) }),
          hovertext: group.data.ids.map((p_id, index) =>
            `${value.idToLabelMapper(p_id)}
            ${(value.resolvedLabelColumnsWithMappedValues ?? []).map((l) => `<br />${columnNameWithDescription(l.info)}: ${getLabelOrUnknown(l.mappedValues.get(p_id))}`)}
            ${value.colorColumn ? `<br />${columnNameWithDescription(value.colorColumn.info)}: ${getLabelOrUnknown(group.data.color[index])}` : ''}
            ${value.shapeColumn && value.shapeColumn.info.id !== value.colorColumn?.info.id ? `<br />${columnNameWithDescription(value.shapeColumn.info)}: ${getLabelOrUnknown(group.data.shape[index])}` : ''}`.trim(),
          ),
          marker: {
            color: value.colorColumn
              ? group.data.color.map((color) =>
                  value.colorColumn.type === EColumnTypes.NUMERICAL
                    ? colorScale(color as number)
                    : value.colorColumn.color
                      ? value.colorColumn.color[color]
                      : scales.color(color),
                )
              : VIS_NEUTRAL_COLOR,
            symbol: value.shapeColumn ? group.data.shape.map((shape) => shapeScale(shape as string)) : 'circle',
            opacity: config.alphaSliderVal,
          },
          ...baseData(config.alphaSliderVal),
        } as PlotlyTypes.Data;
      });

      if (showLegend) {
        plots.push(...legendData);
      }

      return plots;
    }

    if (splom) {
      // SPLOM case
      const plotlyDimensions = value.validColumns.map((col) => ({
        label: col.info.name,
        values: col.resolvedValues.map((v) => v.val),
      }));

      const traces = [
        {
          ...BASE_DATA,
          type: 'splom',
          // @ts-ignore
          dimensions: plotlyDimensions,
          hovertext: value.validColumns[0].resolvedValues.map((v, i) =>
            `${value.idToLabelMapper(v.id)}
  ${(value.resolvedLabelColumns ?? []).map((l) => `<br />${columnNameWithDescription(l.info)}: ${getLabelOrUnknown(l.resolvedValues[i].val)}`)}
  ${value.colorColumn ? `<br />${columnNameWithDescription(value.colorColumn.info)}: ${getLabelOrUnknown(value.colorColumn.resolvedValues[i].val)}` : ''}
  ${value.shapeColumn && value.shapeColumn.info.id !== value.colorColumn?.info.id ? `<br />${columnNameWithDescription(value.shapeColumn.info)}: ${getLabelOrUnknown(value.shapeColumn.resolvedValues[i].val)}` : ''}`.trim(),
          ),
          ...(isEmpty(selectedList) ? {} : { selectedpoints: selectedList.map((idx) => splom.idToIndex.get(idx)) }),
          marker: {
            color: value.colorColumn
              ? value.colorColumn.resolvedValues.map((v) =>
                  value.colorColumn.type === EColumnTypes.NUMERICAL
                    ? colorScale(v.val as number)
                    : value.colorColumn.color
                      ? value.colorColumn.color[v.val]
                      : scales.color(v.val),
                )
              : VIS_NEUTRAL_COLOR,
            symbol: value.shapeColumn ? value.shapeColumn.resolvedValues.map((v) => shapeScale(v.val as string)) : 'circle',
            opacity: config.alphaSliderVal,
          },
          ...baseData(config.alphaSliderVal),
        } as PlotlyTypes.Data,
      ];

      if (showLegend) {
        traces.push(...legendData);
      }

      return traces;
    }

    return [];
  }, [status, value, scatter, config, facet, splom, selectedList, showLegend, colorScale, scales, shapeScale, legendData]);

  return (
    <Stack gap={0} style={{ height: '100%', width: '100%' }} pos="relative">
      {showDragModeOptions || showDownloadScreenshot ? (
        <Center>
          <Group>
            {showDragModeOptions ? (
              <BrushOptionButtons callback={(dragMode: EScatterSelectSettings) => setConfig({ ...config, dragMode })} dragMode={config.dragMode} />
            ) : null}
            {showDownloadScreenshot && layout ? <DownloadPlotButton uniquePlotId={id} config={config} /> : null}
          </Group>
        </Center>
      ) : null}
      {status === 'success' && layout ? (
        <>
          {config.showLegend === undefined ? (
            <Tooltip label="Toggle legend" refProp="rootRef">
              <Switch
                styles={{ label: { paddingLeft: '5px' } }}
                size="xs"
                disabled={legendData.length === 0}
                style={{ position: 'absolute', right: 42, top: 18, zIndex: 99 }}
                defaultChecked
                label="Legend"
                onChange={() => {
                  setShowLegend(!showLegend);
                  // TODO: resize
                }}
                checked={showLegend}
              />
            </Tooltip>
          ) : null}
          <PlotlyComponent
            data-testid="ScatterPlotTestId"
            key={id}
            divId={id}
            data={data}
            layout={layout}
            onUpdate={(figure) => {
              console.log(figure.layout);
              internalLayoutRef.current = cloneDeep(figure.layout);
            }}
            onDeselect={() => {
              selectionCallback([]);
            }}
            onSelected={(event) => {
              if (event && event.points.length > 0) {
                const mergeIntoSelection = (ids: string[]) => {
                  if (shiftPressed) {
                    selectionCallback(Array.from(new Set([...selectedList, ...ids])));
                  } else {
                    selectionCallback(ids);
                  }
                };

                if (scatter) {
                  const ids = event.points.map((point) => scatter.ids[point.pointIndex]);
                  mergeIntoSelection(ids);
                }

                if (splom) {
                  const ids = event.points.map((point) => splom.ids[point.pointIndex]);
                  mergeIntoSelection(ids);
                }

                if (facet) {
                  // Get xref and yref of selecting plot
                  const { xaxis, yaxis } = event.points[0].data;

                  // Find group
                  const group = facet.resultData.find((g) => g.xref === xaxis && g.yref === yaxis);

                  const ids = event.points.map((point) => group.data.ids[point.pointIndex]);
                  mergeIntoSelection(ids);
                }
              }
            }}
            config={{ responsive: true, scrollZoom, displayModeBar: false }}
            useResizeHandler
            style={{ width: '100%', height: '100%' }}
          />
        </>
      ) : status !== 'pending' && status !== 'idle' ? (
        <InvalidCols headerMessage={i18n.t('visyn:vis.errorHeader')} bodyMessage={error?.message || i18n.t('visyn:vis.scatterError')} />
      ) : null}
    </Stack>
  );
}
