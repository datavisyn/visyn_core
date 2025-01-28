/* eslint-disable react-compiler/react-compiler */
import * as React from 'react';

import { css } from '@emotion/css';
import { Center, Group, ScrollArea, Stack, Switch, Tooltip } from '@mantine/core';
import { useElementSize, useWindowEvent } from '@mantine/hooks';
import * as d3v7 from 'd3v7';
import cloneDeep from 'lodash/cloneDeep';
import uniq from 'lodash/uniq';
import uniqueId from 'lodash/uniqueId';

import { fitRegressionLine } from './Regression';
import { ERegressionLineType, IRegressionResult, IScatterConfig } from './interfaces';
import { useData } from './useData';
import { useDataPreparation } from './useDataPreparation';
import { useLayout } from './useLayout';
import { defaultRegressionLineStyle, fetchColumnData, regressionToAnnotation } from './utils';
import { useAsync } from '../../hooks';
import { i18n } from '../../i18n/I18nextManager';
import { PlotlyComponent, PlotlyTypes } from '../../plotly';
import { categoricalColors10, getCssValue } from '../../utils';
import { DownloadPlotButton } from '../general/DownloadPlotButton';
import { LegendItem } from '../general/LegendItem';
import { WarningMessage } from '../general/WarningMessage';
import { VIS_NEUTRAL_COLOR } from '../general/constants';
import { EColumnTypes, ENumericalColorScaleType, EScatterSelectSettings, ICommonVisProps } from '../interfaces';
import { BrushOptionButtons } from '../sidebar/BrushOptionButtons';

function Legend({
  categories,
  hiddenCategoriesSet,
  colorMap,
  onClick,
}: {
  categories: string[];
  hiddenCategoriesSet?: Set<string>;
  colorMap: (v: number | string) => string;
  onClick: (category: string) => void;
}) {
  return (
    <ScrollArea
      data-testid="PlotLegend"
      style={{ height: '100%' }}
      scrollbars="y"
      className={css`
        .mantine-ScrollArea-viewport > div {
          display: flex !important;
          flex-direction: column !important;
        }
      `}
    >
      <Stack gap={0}>
        {categories.map((c) => (
          <LegendItem key={c} color={colorMap(c)} label={c} onClick={() => onClick(c)} filtered={hiddenCategoriesSet?.has(c) ?? false} />
        ))}
      </Stack>
    </ScrollArea>
  );
}

// d3v7.force

const lineStyleToPlotlyShapeLine = (lineStyle: { colors: string[]; colorSelected: number; width: number; dash: PlotlyTypes.Dash }) => {
  return {
    color: lineStyle.colors[lineStyle.colorSelected],
    width: lineStyle.width,
    dash: lineStyle.dash,
  };
};

export function ScatterVis({
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
  scrollZoom,
  uniquePlotId,
  showDownloadScreenshot,
}: ICommonVisProps<IScatterConfig>) {
  const id = React.useMemo(() => uniquePlotId || uniqueId('ScatterVis'), [uniquePlotId]);

  const [shiftPressed, setShiftPressed] = React.useState(false);
  const [showLegend, setShowLegend] = React.useState(false);

  const [hiddenCategoriesSet, setHiddenCategoriesSet] = React.useState<Set<string>>(new Set<string>());

  // const [ref, { width, height }] = useResizeObserver();
  const { ref, width, height } = useElementSize();

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
    config.subplots,
    config.color,
    config.shape,
    config.facets,
  ]);

  // Subtract header
  // const width = Math.max(dimensions.width, 0);
  // const height = Math.max(dimensions.height - 40, 0);

  // Ref to previous arguments for useAsync
  const previousArgs = React.useRef<typeof args>(args);

  // Plotlys internal layout state
  const internalLayoutRef = React.useRef<Partial<PlotlyTypes.Layout>>({});

  // If the useAsync arguments change, clear the internal layout state.
  // Why not just use the config to compare things?
  // Because the useAsync takes one render cycle to update the value, and inbetween that, plotly has already updated the internalLayoutRef again with the old one.
  if (
    args?.[1] !== previousArgs.current?.[1] ||
    args?.[6] !== previousArgs.current?.[6] ||
    args?.[3] !== previousArgs.current?.[3] ||
    config?.xAxisScale !== internalLayoutRef.current?.xaxis?.type ||
    config?.yAxisScale !== internalLayoutRef.current?.yaxis?.type
  ) {
    internalLayoutRef.current = {};
    previousArgs.current = args;
  }

  const { subplots, scatter, splom, facet, shapeScale } = useDataPreparation({
    hiddenCategoriesSet,
    numColorScaleType: config.numColorScaleType,
    status,
    uniqueSymbols,
    value,
  });

  const regressions = React.useMemo<{
    results: IRegressionResult[];
    shapes: Partial<PlotlyTypes.Shape>[];
    annotations: Partial<PlotlyTypes.Annotations>[];
  }>(() => {
    if (status !== 'success' || !value || !config.regressionLineOptions?.type || config.regressionLineOptions.type === ERegressionLineType.NONE) {
      return { shapes: [], annotations: [], results: [] };
    }

    if (subplots) {
      const shapes: Partial<PlotlyTypes.Shape>[] = [];
      const annotations: Partial<PlotlyTypes.Annotations>[] = [];
      const results: IRegressionResult[] = [];

      subplots.xyPairs.forEach((pair) => {
        const curveFit = fitRegressionLine(
          { x: pair.validIndices.map((i) => pair.x[i]) as number[], y: pair.validIndices.map((i) => pair.y[i]) as number[] },
          config.regressionLineOptions.type,
          pair.xref,
          pair.yref,
          config.regressionLineOptions.fitOptions,
        );

        if (!curveFit.svgPath.includes('NaN')) {
          shapes.push({
            type: 'path',
            path: curveFit.svgPath,
            line: lineStyleToPlotlyShapeLine({ ...defaultRegressionLineStyle, ...config.regressionLineOptions.lineStyle }),
            xref: pair.xref,
            yref: pair.yref,
          });

          results.push(curveFit);
        }
      });

      return { shapes, results, annotations };
    }

    if (scatter) {
      const curveFit = fitRegressionLine(
        {
          x: scatter.plotlyData.validIndices.map((i) => scatter.plotlyData.x[i]) as number[],
          y: scatter.plotlyData.validIndices.map((i) => scatter.plotlyData.y[i]) as number[],
        },
        config.regressionLineOptions.type,
        'x',
        'y',
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
          annotations: config.regressionLineOptions.showStats !== false ? [regressionToAnnotation(curveFit, 3, 'x', 'y')] : [],
        };
      }
    }

    if (facet) {
      const shapes: Partial<PlotlyTypes.Shape>[] = [];
      const annotations: Partial<PlotlyTypes.Annotations>[] = [];
      const results: IRegressionResult[] = [];

      facet.resultData.forEach((group) => {
        const curveFit = fitRegressionLine(
          { x: group.data.validIndices.map((i) => group.data.x[i]) as number[], y: group.data.validIndices.map((i) => group.data.y[i]) as number[] },
          config.regressionLineOptions.type,
          group.xref,
          group.yref,
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

          results.push(curveFit);
        }
      });

      return { shapes, results, annotations };
    }

    if (splom) {
      // SPLOM case, fit a curve through each pair
      const results: IRegressionResult[] = [];
      const plotlyShapes: Partial<PlotlyTypes.Shape>[] = [];
      // eslint-disable-next-line guard-for-in
      splom.xyPairs.forEach((pair) => {
        const curveFit = fitRegressionLine(
          { x: pair.data.validIndices.map((i) => pair.data.x[i]), y: pair.data.validIndices.map((i) => pair.data.y[i]) },
          config.regressionLineOptions.type,
          pair.xref,
          pair.yref,
          config.regressionLineOptions.fitOptions,
        );

        if (!curveFit.svgPath.includes('NaN')) {
          plotlyShapes.push({
            type: 'path',
            path: curveFit.svgPath,
            line: lineStyleToPlotlyShapeLine({ ...defaultRegressionLineStyle, ...config.regressionLineOptions.lineStyle }),
            xref: pair.xref,
            yref: pair.yref,
          });

          results.push(curveFit);
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
    config.regressionLineOptions.showStats,
    subplots,
    scatter,
    facet,
    splom,
  ]);

  const layout = useLayout({
    scatter,
    facet,
    splom,
    subplots,
    regressions,
    config,
    width,
    height,
    internalLayoutRef,
  });

  const legendData = React.useMemo(() => {
    if (!value) {
      return undefined;
    }

    /* const legendPlots: PlotlyTypes.Data[] = [];

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
*/
    if (value.colorColumn && value.colorColumn.type === EColumnTypes.CATEGORICAL) {
      // Get distinct values
      const colorValues = uniq(value.colorColumn.resolvedValues.map((v) => v.val ?? 'Unknown') as string[]);
      const valuesWithoutUnknown = colorValues.filter((v) => v !== 'Unknown');
      const mapping: Record<string, string> = {};

      // Just return the domain when we got a domain from outside
      if (value.colorColumn.color) {
        colorValues.forEach((v) => {
          const mapped = value.colorColumn.color?.[v];
          if (mapped) {
            mapping[v] = mapped;
          } else {
            mapping[v] = VIS_NEUTRAL_COLOR;
          }
        });
      } else {
        // Create d3 color scale
        valuesWithoutUnknown.forEach((v, i) => {
          mapping[v] = categoricalColors10[i % categoricalColors10.length]!;
        });
        mapping.Unknown = VIS_NEUTRAL_COLOR;
      }

      // Sort the colorMap by the order of the domain
      const categories = Object.keys(mapping);
      categories.sort((a, b) => {
        // Unknown should always be last, else alphabetically
        if (a === 'Unknown') {
          return 1;
        }

        if (b === 'Unknown') {
          return -1;
        }

        return a.localeCompare(b);
      });

      // Otherwise infer the domain from the resolved values
      return {
        color: {
          categories,
          mapping,
          mappingFunction: (v: string | number) => mapping[v] || VIS_NEUTRAL_COLOR,
        },
      };
    }
    // Sequential color scale
    if (value.colorColumn && value.colorColumn.type === EColumnTypes.NUMERICAL) {
      const numericalColorScale = d3v7
        .scaleLinear<string, number>()
        .domain([value.colorDomain[0], (value.colorDomain[0] + value.colorDomain[1]) / 2, value.colorDomain[1]])
        .range(
          config?.numColorScaleType === ENumericalColorScaleType.SEQUENTIAL
            ? ([getCssValue('visyn-s1-blue'), getCssValue('visyn-s5-blue'), getCssValue('visyn-s9-blue')] as string[])
            : ([getCssValue('visyn-c1'), '#d3d3d3', getCssValue('visyn-c2')] as string[]),
        );

      return {
        color: {
          categories: [],
          mappingFunction: ((v: string | number) => {
            if (v === undefined || v === 'undefined' || v === null || v === 'null' || v === '') {
              return VIS_NEUTRAL_COLOR;
            }

            return numericalColorScale(v as number);
          }) as (v: string | number) => string,
        },
      };
    }

    return undefined;
  }, [config?.numColorScaleType, value]);

  const data = useData({
    status,
    value,
    scatter,
    config,
    facet,
    splom,
    selectedList,
    subplots,
    shapeScale,
    mappingFunction: legendData?.color.mappingFunction,
  });

  const legendClickCallback = React.useCallback((category: string) => {
    setHiddenCategoriesSet((prevSet) => {
      const newSet = new Set(prevSet);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  }, []);

  return (
    <div
      className={css`
        position: relative;
        width: 100%;
        height: 100%;
        display: grid;
        grid-template-areas:
          'toolbar corner'
          'plot legend';
        grid-template-rows: auto 1fr;
        grid-template-columns: 1fr fit-content(200px);
        grid-row-gap: 0.5rem;
      `}
    >
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

      {status === 'success' && layout && config?.showLegend === undefined ? (
        <div style={{ gridArea: 'corner', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', height: 40 }}>
          <Tooltip label="Toggle legend" refProp="rootRef">
            <Switch
              styles={{ label: { paddingLeft: '5px' } }}
              size="xs"
              disabled={legendData === undefined}
              style={{ position: 'absolute', right: 52, top: 18, zIndex: 99 }}
              defaultChecked
              label="Legend"
              onChange={() => {
                setShowLegend(!showLegend);
                // TODO: resize
              }}
              checked={showLegend}
              data-testid="ToggleLegend"
            />
          </Tooltip>
        </div>
      ) : null}

      <div ref={ref} style={{ gridArea: 'plot', overflow: 'hidden', paddingBottom: '0.5rem' }}>
        {status === 'success' && layout ? (
          <PlotlyComponent
            data-testid="ScatterPlotTestId"
            key={id}
            divId={id}
            data={data}
            layout={layout}
            useResizeHandler
            style={{
              width,
              height,
            }}
            onUpdate={(figure) => {
              internalLayoutRef.current = cloneDeep(figure.layout);
            }}
            onDeselect={() => {
              selectionCallback([]);
            }}
            // @ts-ignore
            onBeforeHover={(evnt) => {
              // Finds the hovered subplot and calls the statscallback with the stats of the regression line
              if ('target' in evnt) {
                const target = evnt.target as HTMLElement;
                const subplot = target.getAttribute('data-subplot');

                if (subplot) {
                  const idx = subplot.indexOf('y');
                  const xref = subplot.slice(0, idx);
                  const yref = subplot.slice(idx);

                  const regressionResult = regressions.results.find((r) => r.xref === xref && r.yref === yref);

                  if (regressionResult) {
                    statsCallback(regressionResult.stats);
                  }
                }
              }
            }}
            onSelected={(event) => {
              if (event && event.points.length > 0 && event.points[0]) {
                const mergeIntoSelection = (ids: string[]) => {
                  if (shiftPressed) {
                    selectionCallback(Array.from(new Set([...selectedList, ...ids])));
                  } else {
                    selectionCallback(ids);
                  }
                };

                if (subplots) {
                  const ids = event.points.map((point) => subplots.ids[point.pointIndex]) as string[];
                  mergeIntoSelection(ids);
                }

                if (scatter) {
                  const ids = event.points.map((point) => scatter.ids[point.pointIndex]) as string[];
                  mergeIntoSelection(ids);
                }

                if (splom) {
                  const ids = event.points.map((point) => splom.ids[point.pointIndex]) as string[];
                  mergeIntoSelection(ids);
                }

                if (facet) {
                  // Get xref and yref of selecting plot
                  const { xaxis, yaxis } = event.points[0].data;

                  // Find group
                  const group = facet.resultData.find((g) => g.xref === xaxis && g.yref === yaxis);

                  if (group) {
                    const ids = event.points.map((point) => group.data.ids[point.pointIndex]) as string[];
                    mergeIntoSelection(ids);
                  }
                }
              }
            }}
            config={{ scrollZoom, displayModeBar: false }}
          />
        ) : status !== 'idle' && status !== 'pending' ? (
          <WarningMessage
            centered
            dataTestId="visyn-vis-missing-column-warning"
            title={i18n.t('visyn:vis.missingColumn.errorHeader')}
            style={{
              gridArea: 'plot',
            }}
          >
            {error?.message || i18n.t('visyn:vis.missingColumn.scatterError')}
          </WarningMessage>
        ) : null}
      </div>

      {status === 'success' && layout && legendData?.color.mapping && showLegend ? (
        <div style={{ gridArea: 'legend', overflow: 'hidden' }}>
          <Legend
            categories={legendData.color.categories}
            colorMap={legendData.color.mappingFunction}
            hiddenCategoriesSet={hiddenCategoriesSet}
            onClick={legendClickCallback}
          />
        </div>
      ) : null}
    </div>
  );
}
