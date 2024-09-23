/* eslint-disable react-compiler/react-compiler */
import * as d3v7 from 'd3v7';
import { useWindowEvent } from '@mantine/hooks';
import { Center, Group, Stack, Tooltip, Switch } from '@mantine/core';
import * as React from 'react';
import debounce from 'lodash/debounce';
import sortBy from 'lodash/sortBy';
import groupBy from 'lodash/groupBy';
import isEmpty from 'lodash/isEmpty';
import cloneDeep from 'lodash/cloneDeep';
import { useAsync } from '../../hooks';
import { PlotlyComponent, PlotlyTypes } from '../../plotly';
import { DownloadPlotButton } from '../general/DownloadPlotButton';
import { VIS_NEUTRAL_COLOR, VIS_TRACES_COLOR } from '../general/constants';
import { EColumnTypes, ENumericalColorScaleType, EScatterSelectSettings, ICommonVisProps } from '../interfaces';
import { BrushOptionButtons } from '../sidebar/BrushOptionButtons';
import { ELabelingOptions, ERegressionLineType, IInternalScatterConfig, IRegressionResult } from './interfaces';
import { fetchColumnData, regressionToAnnotation } from './utilsNew';
import { getLabelOrUnknown } from '../general/utils';
import { getCssValue } from '../../utils/getCssValue';
import { selectionColorDark } from '../../utils/colors';
import { columnNameWithDescription, truncateText } from '../general/layoutUtils';
import { fitRegressionLine } from './Regression';
import { defaultRegressionLineStyle } from './utils';
import { useDataPreparation } from './useDataPreparation';
import { InvalidCols } from '../general/InvalidCols';
import { i18n } from '../../i18n/I18nextManager';

// d3v7.forc

const BASE_LAYOUT: Partial<PlotlyTypes.Layout> = {
  hovermode: 'closest',
  margin: { l: 50, r: 50, b: 50, t: 50, pad: 4 },
};

const lineStyleToPlotlyShapeLine = (lineStyle: { colors: string[]; colorSelected: number; width: number; dash: PlotlyTypes.Dash }) => {
  return {
    color: lineStyle.colors[lineStyle.colorSelected],
    width: lineStyle.width,
    dash: lineStyle.dash,
  };
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

  const [forcePositions, setForcePositions] = React.useState<{ x: number[]; y: number[] }>(undefined);

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

  const { scatter, splom, facet } = useDataPreparation({ value, status });

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
        const curveFit = fitRegressionLine(
          { x: group.data.map((e) => e.x as number), y: group.data.map((e) => e.y as number) },
          config.regressionLineOptions.type,
          config.regressionLineOptions.fitOptions,
        );

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
          title: {
            text: scatter.xLabel,
            font: {
              size: 12,
              color: VIS_TRACES_COLOR,
            },
          },
          ...internalLayoutRef.current?.xaxis,
        },
        yaxis: {
          title: {
            text: scatter.yLabel,
            font: {
              size: 12,
              color: VIS_TRACES_COLOR,
            },
          },
          ...internalLayoutRef.current?.yaxis,
        },
        shapes: regressions.shapes,
        annotations: regressions.annotations,
      };

      return finalLayout;
    }

    if (facet) {
      const axes: Record<string, Partial<PlotlyTypes.LayoutAxis>> = {};
      const titleAnnotations: Partial<PlotlyTypes.Annotations>[] = [];

      facet.resultData.forEach((group, plotCounter) => {
        axes[`xaxis${plotCounter > 0 ? plotCounter + 1 : ''}`] = {
          range: facet.xDomain,
          // Spread the previous layout to keep things like zoom
          ...(internalLayoutRef.current?.[`xaxis${plotCounter > 0 ? plotCounter + 1 : ''}` as 'xaxis'] || {}),
          // This enables axis sharing, but is really slow for some reason
          ...(plotCounter > 0 ? { matches: 'x' } : {}),
          // @ts-ignore
          anchor: `y${plotCounter > 0 ? plotCounter + 1 : ''}`,
        };
        axes[`yaxis${plotCounter > 0 ? plotCounter + 1 : ''}`] = {
          range: facet.yDomain,
          // Spread the previous layout to keep things like zoom
          ...(internalLayoutRef.current?.[`yaxis${plotCounter > 0 ? plotCounter + 1 : ''}` as 'yaxis'] || {}),
          // This enables axis sharing, but is really slow for some reason
          ...(plotCounter > 0 ? { matches: 'y' } : {}),
          // @ts-ignore
          anchor: `x${plotCounter > 0 ? plotCounter + 1 : ''}`,
        };
        titleAnnotations.push({
          x: 0.5,
          y: 1,
          xref: `x${plotCounter > 0 ? plotCounter + 1 : ''} domain` as PlotlyTypes.XAxisName,
          yref: `y${plotCounter > 0 ? plotCounter + 1 : ''} domain` as PlotlyTypes.YAxisName,
          xanchor: 'center',
          yanchor: 'bottom',
          text: group.data[0].facet,
          showarrow: false,
          font: {
            size: 12,
            color: VIS_TRACES_COLOR,
          },
        });
      });

      const finalLayout: Partial<PlotlyTypes.Layout> = {
        ...BASE_LAYOUT,
        ...(internalLayoutRef.current || {}),
        grid: { rows: 2, columns: 3, xgap: 0.2, ygap: 0.3, pattern: 'independent' },
        ...axes,
        annotations: [...titleAnnotations, ...regressions.annotations],
        shapes: regressions.shapes,
      };

      return finalLayout;
    }

    if (splom) {
      // SPLOM case
      const axes: Record<string, PlotlyTypes.LayoutAxis> = {};

      const axis = () =>
        ({
          showline: false,
          zeroline: false,
          gridcolor: '#E0E0E0',
          ticklen: 4,
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
      };

      return finalLayout;
    }

    return undefined;
  }, [scatter, facet, splom, regressions.shapes, regressions.annotations, value?.validColumns.length]);

  // Control certain plotly behaviors
  if (layout) {
    layout.dragmode = config.dragMode;
    // layout.shapes = regressions.shapes;
  }

  const data = React.useMemo<PlotlyTypes.Data[]>(() => {
    if (status !== 'success' || !value) {
      return [];
    }

    const numericalColorScale = value.colorColumn
      ? d3v7
          .scaleLinear<string, number>()
          .domain([value.colorDomain[1], (value.colorDomain[0] + value.colorDomain[1]) / 2, value.colorDomain[0]])
          .range(
            config.numColorScaleType === ENumericalColorScaleType.SEQUENTIAL
              ? [getCssValue('visyn-s9-blue'), getCssValue('visyn-s5-blue'), getCssValue('visyn-s1-blue')]
              : [getCssValue('visyn-c1'), '#d3d3d3', getCssValue('visyn-c2')],
          )
      : null;

    const shapeScale = value.shapeColumn
      ? d3v7
          .scaleOrdinal<string>()
          .domain(value.shapeColumn.resolvedValues.map((v) => v.val as string))
          .range(uniqueSymbols)
      : null;

    if (scatter) {
      const traces = [
        {
          type: 'scattergl',
          x: scatter.plotlyData.x,
          y: scatter.plotlyData.y,
          showlegend: false,
          // text: scatter.plotlyData.text,
          // @ts-ignore
          textposition: 'top center',
          xaxis: 'x',
          yaxis: 'y',
          ...(isEmpty(selectedList) ? {} : { selectedpoints: selectedList.map((idx) => scatter.idToIndex.get(idx)) }),
          mode: config.showLabels === ELabelingOptions.NEVER ? 'markers' : 'text+markers',
          ...(config.showLabels === ELabelingOptions.NEVER
            ? {}
            : config.showLabels === ELabelingOptions.ALWAYS
              ? {
                  text: scatter.plotlyData.text.map((t) => truncateText(t, true, 10)),
                  textposition: 'top center',
                }
              : {
                  text: scatter.plotlyData.text.map((t, i) => (selectedList.includes(scatter.ids[i]) ? truncateText(t, true, 10) : '')),
                  textposition: 'top center',
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
                    ? numericalColorScale(v.val as number)
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
        /* {
          type: 'scattergl',
          name: '',
          x: forcePositions ? forcePositions.x : scatter.plotlyData.x.map((x) => x),
          y: forcePositions ? forcePositions.y : scatter.plotlyData.y.map((y) => y),
          showlegend: false,
          hoverinfo: 'none',
          hovertemplate: '',
          text: scatter.plotlyData.text,
          textposition: 'top center',
          xaxis: 'x',
          yaxis: 'y',
          selectedpoints: undefined,
          mode: 'text',
        } as PlotlyTypes.Data, */
      ];

      return traces;
    }

    if (facet) {
      const xLabel = columnNameWithDescription(value.validColumns[0].info);
      const yLabel = columnNameWithDescription(value.validColumns[1].info);

      const plots = facet.resultData.map((group) => {
        return {
          type: 'scattergl',
          x: group.data.map((d) => d.x as number),
          y: group.data.map((d) => d.y as number),
          showlegend: false,
          xaxis: group.xref,
          yaxis: group.yref,
          mode: 'markers',
          name: getLabelOrUnknown(group.data[0].facet),
          ...(isEmpty(selectedList) ? {} : { selectedpoints: selectedList.map((idx) => group.idToIndex.get(idx)).filter((v) => v !== undefined) }),
          hovertext: group.data.map((d) =>
            `${value.idToLabelMapper(d.ids)}
            <br />${xLabel}: ${d.x}
            <br />${yLabel}: ${d.y}
            ${(value.resolvedLabelColumnsWithMappedValues ?? []).map((l) => `<br />${columnNameWithDescription(l.info)}: ${getLabelOrUnknown(l.mappedValues.get(d.ids))}`)}
            ${value.colorColumn ? `<br />${columnNameWithDescription(value.colorColumn.info)}: ${getLabelOrUnknown(d.color)}` : ''}
            ${value.shapeColumn && value.shapeColumn.info.id !== value.colorColumn?.info.id ? `<br />${columnNameWithDescription(value.shapeColumn.info)}: ${getLabelOrUnknown(d.shape)}` : ''}`.trim(),
          ),
          marker: {
            color: value.colorColumn
              ? group.data.map((d) =>
                  value.colorColumn.type === EColumnTypes.NUMERICAL
                    ? numericalColorScale(d.color as number)
                    : value.colorColumn.color
                      ? value.colorColumn.color[d.color]
                      : scales.color(d.color),
                )
              : VIS_NEUTRAL_COLOR,
            symbol: value.shapeColumn ? group.data.map((d) => shapeScale(d.shape as string)) : 'circle',
            opacity: config.alphaSliderVal,
          },
          ...baseData(config.alphaSliderVal),
        } as PlotlyTypes.Data;
      });

      return plots;
    }

    if (splom) {
      // SPLOM case
      const plotlyDimensions = value.validColumns.map((col) => ({
        label: col.info.name,
        values: col.resolvedValues.map((v) => v.val),
      }));

      return [
        {
          type: 'splom',
          // @ts-ignore
          dimensions: plotlyDimensions,
          showlegend: false,
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
                    ? numericalColorScale(v.val as number)
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
    }

    return [];
  }, [status, value, config.numColorScaleType, config.showLabels, config.alphaSliderVal, uniqueSymbols, scatter, facet, splom, selectedList, scales]);

  const fixLabels = () => {
    // Get plotly div
    const div = document.getElementById(id);

    if (scatter) {
      const subplot = div.querySelector('.xy').querySelector('[data-subplot="xy"]');
      const { width } = subplot.getBoundingClientRect();
      const { xaxis, yaxis } = internalLayoutRef.current;

      const trueSize = 10;
      const scaleFactor = width / trueSize;

      const scaleX = d3v7.scaleLinear().domain([xaxis.range[0], xaxis.range[1]]).range([0, trueSize]);
      const scaleY = d3v7.scaleLinear().domain([yaxis.range[0], yaxis.range[1]]).range([0, trueSize]);

      // Create d3 force layout
      const simulation = d3v7.forceSimulation(
        scatter.plotlyData.text.map((d, i) => ({ x: scaleX(scatter.plotlyData.x[i]), y: scaleY(scatter.plotlyData.y[i]), text: d })),
      );

      // Add repellant force
      // 12 px to normalized radius
      simulation.force('collide', d3v7.forceCollide(12 / scaleFactor).strength(0.01));

      // Add link force to original position
      simulation.force(
        'x',
        d3v7
          .forceX((datum, index) => {
            return scaleX(scatter.plotlyData.x[index]);
          })
          .strength(1),
      );

      simulation.force(
        'y',
        d3v7
          .forceY((datum, index) => {
            return scaleY(scatter.plotlyData.y[index]) + 16 / scaleFactor;
          })
          .strength(1),
      );

      // Simulate 100 steps
      simulation.tick(300);

      // Get new positions
      const positions = simulation.nodes();

      setForcePositions({
        x: positions.map((d) => scaleX.invert(d.x)),
        y: positions.map((d) => scaleY.invert(d.y)),
      });
    }
  };

  const fixRef = React.useRef<() => void>(fixLabels);
  fixRef.current = fixLabels;

  const debouncedForce = React.useMemo(() => {
    return debounce(() => fixRef.current(), 1000);
  }, []);

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
          {/* {config.showLegend === undefined ? (
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
          ) : null} */}
          <PlotlyComponent
            data-testid="ScatterPlotTestId"
            key={id}
            divId={id}
            data={data}
            layout={layout}
            onUpdate={(figure) => {
              // debouncedForce();
              internalLayoutRef.current = cloneDeep(figure.layout);
            }}
            onDeselect={() => {
              selectionCallback([]);
            }}
            onSelected={(event) => {
              if (event && event.points.length > 0) {
                // These are the scatter trace points, not the text trace points!
                // const scatterPoints = event.points.filter((point) => !('text' in point));
                const scatterPoints = event.points;

                const mergeIntoSelection = (ids: string[]) => {
                  if (shiftPressed) {
                    selectionCallback(Array.from(new Set([...selectedList, ...ids])));
                  } else {
                    selectionCallback(ids);
                  }
                };

                if (scatter) {
                  const ids = scatterPoints.map((point) => scatter.ids[point.pointIndex]);
                  mergeIntoSelection(ids);
                }

                if (splom) {
                  const ids = scatterPoints.map((point) => splom.ids[point.pointIndex]);
                  mergeIntoSelection(ids);
                }

                if (facet) {
                  // Get xref and yref of selecting plot
                  const { xaxis, yaxis } = scatterPoints[0].data;

                  // Find group
                  const group = facet.resultData.find((g) => g.xref === xaxis && g.yref === yaxis);

                  const ids = scatterPoints.map((point) => group.data[point.pointIndex].ids);
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
