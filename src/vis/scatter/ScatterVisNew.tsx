/* eslint-disable react-compiler/react-compiler */
import * as d3v7 from 'd3v7';
import { Center, Group, Stack, deepMerge } from '@mantine/core';
import * as React from 'react';
import sortBy from 'lodash/sortBy';
import groupBy from 'lodash/groupBy';
import cloneDeep from 'lodash/cloneDeep';
import { useAsync } from '../../hooks';
import { PlotlyComponent, PlotlyTypes } from '../../plotly';
import { DownloadPlotButton } from '../general/DownloadPlotButton';
import { VIS_NEUTRAL_COLOR, VIS_TRACES_COLOR } from '../general/constants';
import { EColumnTypes, ENumericalColorScaleType, EScatterSelectSettings, ICommonVisProps } from '../interfaces';
import { BrushOptionButtons } from '../sidebar/BrushOptionButtons';
import { ERegressionLineType, IInternalScatterConfig, IRegressionResult } from './interfaces';
import { fetchColumnData } from './utilsNew';
import { getLabelOrUnknown } from '../general/utils';
import { getCssValue } from '../../utils/getCssValue';
import { selectionColorDark } from '../../utils/colors';
import { columnNameWithDescription } from '../general/layoutUtils';
import { fitRegressionLine } from './Regression';
import { defaultRegressionLineStyle } from './utils';

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
        color: selectionColorDark,
      },
      marker: {
        opacity: 1,
        color: selectionColorDark,
      },
    },
    unselected: {
      textfont: {
        color: selectionColorDark,
      },
      marker: {
        color: VIS_NEUTRAL_COLOR,
        opacity: Math.min(alpha, 0.5),
      },
    },
  };
}

export function ScatterVisNew({
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
  const id = `ScatterVis_${React.useId()}`;

  // Base data to work on
  const { value, status, args } = useAsync(fetchColumnData, [
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

  // Case when we have just a scatterplot
  const scatter = React.useMemo(() => {
    if (!(status === 'success' && value && value.validColumns.length === 2 && !value.facetColumn)) {
      return undefined;
    }

    const xLabel = columnNameWithDescription(value.validColumns[0].info);
    const yLabel = columnNameWithDescription(value.validColumns[1].info);

    const plotlyData = value.validColumns[0].resolvedValues.map((v, i) => ({
      x: v.val,
      y: value.validColumns[1].resolvedValues[i].val,
      ids: v.id?.toString(),
      color: value.colorColumn ? value.colorColumn.resolvedValues[i].val : undefined,
      shape: value.shapeColumn ? value.shapeColumn.resolvedValues[i].val : undefined,
    }));

    return {
      plotlyData,
      xLabel,
      yLabel,
    };
  }, [status, value]);

  // Case when we have a scatterplot matrix
  const splom = React.useMemo(() => {
    if (!(status === 'success' && value && value.validColumns.length > 2)) {
      return undefined;
    }

    const plotlyDimensions = value.validColumns.map((col) => ({
      label: col.info.name,
      values: col.resolvedValues.map((v) => v.val),
    }));

    // Split up data to xy plot pairs (for regression and subplots)
    const xyPairs: { data: { x: number; y: number }[]; xref: PlotlyTypes.XAxisName; yref: PlotlyTypes.YAxisName }[] = [];

    for (let r = 0; r < value.validColumns.length; r++) {
      for (let c = 0; c < value.validColumns.length; c++) {
        const plotlyData = value.validColumns[r].resolvedValues.map((v, i) => ({
          x: v.val as number,
          y: value.validColumns[c].resolvedValues[i].val as number,
        }));

        xyPairs.push({ data: plotlyData, xref: `x${c > 0 ? c + 1 : ''}` as PlotlyTypes.XAxisName, yref: `y${r > 0 ? r + 1 : ''}` as PlotlyTypes.YAxisName });
      }
    }

    return {
      dimensions: plotlyDimensions,
      xyPairs,
    };
  }, [status, value]);

  // Case when we have faceting
  const facet = React.useMemo(() => {
    if (!(status === 'success' && value && value.facetColumn && value.validColumns.length === 2)) {
      return undefined;
    }

    const plotlyData = value.validColumns[0].resolvedValues.map((v, i) => ({
      x: v.val,
      y: value.validColumns[1].resolvedValues[i].val,
      ids: v.id?.toString(),
      facet: value.facetColumn.resolvedValues[i].val?.toString(),
      color: value.colorColumn ? value.colorColumn.resolvedValues[i].val : undefined,
      shape: value.shapeColumn ? value.shapeColumn.resolvedValues[i].val : undefined,
    }));

    const sortOrder =
      (value.facetColumn.domain as string[]) ||
      [...new Set(value.facetColumn.resolvedValues.map((v) => v.val as string))].sort((a, b) => a?.localeCompare(b, undefined, { sensitivity: 'base' }));

    const groupedData = sortBy(groupBy(plotlyData, 'facet'), (group) => {
      const facetValue = group[0].facet;
      const index = sortOrder.indexOf(facetValue);
      return index !== -1 ? index : Infinity;
    });

    // Get shared range for all plots
    const xDomain = d3v7.extent(value.validColumns[0].resolvedValues.map((v) => v.val as number));
    const yDomain = d3v7.extent(value.validColumns[1].resolvedValues.map((v) => v.val as number));

    return {
      groupedData,
      xDomain,
      yDomain,
    };
  }, [status, value]);

  const regressions = React.useMemo<{ results: IRegressionResult[]; shapes: Partial<PlotlyTypes.Shape>[] }>(() => {
    if (status !== 'success' || !value || !config.regressionLineOptions?.type || config.regressionLineOptions.type === ERegressionLineType.NONE) {
      return { shapes: [], results: [] };
    }

    if (scatter) {
      const curveFit = fitRegressionLine(
        { x: scatter.plotlyData.map((e) => e.x), y: scatter.plotlyData.map((e) => e.y) },
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
        };
      }
    }

    if (facet) {
      const plotlyShapes: Partial<PlotlyTypes.Shape>[] = [];

      facet.groupedData.forEach((group, plotCounter) => {
        const curveFit = fitRegressionLine(
          { x: group.map((e) => e.x), y: group.map((e) => e.y) },
          config.regressionLineOptions.type,
          config.regressionLineOptions.fitOptions,
        );

        if (!curveFit.svgPath.includes('NaN')) {
          plotlyShapes.push({
            type: 'path',
            path: curveFit.svgPath,
            line: lineStyleToPlotlyShapeLine({ ...defaultRegressionLineStyle, ...config.regressionLineOptions.lineStyle }),
            xref: `x${plotCounter > 0 ? plotCounter + 1 : ''}` as PlotlyTypes.XAxisName,
            yref: `y${plotCounter > 0 ? plotCounter + 1 : ''}` as PlotlyTypes.YAxisName,
          });
        }
      });

      return { shapes: plotlyShapes, results: [] };
    }

    if (splom) {
      // SPLOM case, fit a curve through each pair
      const results: IRegressionResult[] = [];
      const plotlyShapes: Partial<PlotlyTypes.Shape>[] = [];
      // eslint-disable-next-line guard-for-in
      splom.xyPairs.forEach((pair, i) => {
        const curveFit = fitRegressionLine(
          { x: pair.data.map((e) => e.x), y: pair.data.map((e) => e.y) },
          config.regressionLineOptions.type,
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
        }
      });

      return { shapes: plotlyShapes, results };
    }

    return { shapes: [], results: [] };
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
      };

      return finalLayout;
    }

    if (facet) {
      const axes: Record<string, Partial<PlotlyTypes.LayoutAxis>> = {};
      const titleAnnotations: Partial<PlotlyTypes.Annotations>[] = [];

      facet.groupedData.forEach((group, plotCounter) => {
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
          text: group[0].facet,
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
        annotations: titleAnnotations,
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

      const finalLayout = deepMerge(
        {
          ...BASE_LAYOUT,
          ...axes,
        },
        internalLayoutRef.current,
      );

      return finalLayout;
    }

    return {};
  }, [scatter, facet, splom, regressions.shapes, value?.validColumns?.length]);

  // Control certain plotly behaviors
  if (layout) {
    layout.dragmode = config.dragMode;
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
          .range(shapes)
      : null;

    if (scatter) {
      return [
        {
          type: 'scattergl',
          x: scatter.plotlyData.map((e) => e.x),
          y: scatter.plotlyData.map((e) => e.y),
          showlegend: false,
          xaxis: 'x',
          yaxis: 'y',
          mode: 'markers',
          hovertext: value.validColumns[0].resolvedValues.map((v, i) =>
            `${value.idToLabelMapper(v.id)}
  ${(value.resolvedLabelColumns ?? []).map((l) => `<br />${columnNameWithDescription(l.info)}: ${getLabelOrUnknown(l.resolvedValues[i].val)}`)}
  ${value.colorColumn ? `<br />${columnNameWithDescription(value.colorColumn.info)}: ${getLabelOrUnknown(value.colorColumn.resolvedValues[i].val)}` : ''}
  ${value.shapeColumn && value.shapeColumn.info.id !== value.colorColumn?.info.id ? `<br />${columnNameWithDescription(value.shapeColumn.info)}: ${getLabelOrUnknown(value.shapeColumn.resolvedValues[i].val)}` : ''}`.trim(),
          ),
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

    if (facet) {
      const xLabel = columnNameWithDescription(value.validColumns[0].info);
      const yLabel = columnNameWithDescription(value.validColumns[1].info);

      const plots = facet.groupedData.map((group, plotCounter) => {
        return {
          type: 'scattergl',
          x: group.map((d) => d.x as number),
          y: group.map((d) => d.y as number),
          showlegend: false,
          // ids: group.map((d) => d.ids),
          xaxis: plotCounter === 0 ? 'x' : `x${plotCounter + 1}`,
          yaxis: plotCounter === 0 ? 'y' : `y${plotCounter + 1}`,
          mode: 'markers',
          name: getLabelOrUnknown(group[0].facet),
          hovertext: group.map((d) =>
            `${value.idToLabelMapper(d.ids)}
            <br />${xLabel}: ${d.x}
            <br />${yLabel}: ${d.y}
            ${(value.resolvedLabelColumnsWithMappedValues ?? []).map((l) => `<br />${columnNameWithDescription(l.info)}: ${getLabelOrUnknown(l.mappedValues.get(d.ids))}`)}
            ${value.colorColumn ? `<br />${columnNameWithDescription(value.colorColumn.info)}: ${getLabelOrUnknown(d.color)}` : ''}
            ${value.shapeColumn && value.shapeColumn.info.id !== value.colorColumn?.info.id ? `<br />${columnNameWithDescription(value.shapeColumn.info)}: ${getLabelOrUnknown(d.shape)}` : ''}`.trim(),
          ),
          marker: {
            color: value.colorColumn
              ? group.map((d) =>
                  value.colorColumn.type === EColumnTypes.NUMERICAL
                    ? numericalColorScale(d.color as number)
                    : value.colorColumn.color
                      ? value.colorColumn.color[d.color]
                      : scales.color(d.color),
                )
              : VIS_NEUTRAL_COLOR,
            symbol: value.shapeColumn ? group.map((d) => shapeScale(d.shape as string)) : 'circle',
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
  }, [status, value, config.numColorScaleType, config.alphaSliderVal, shapes, scatter, facet, splom, scales]);

  return (
    <Stack gap={0} style={{ height: '100%', width: '100%' }} pos="relative">
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
      <PlotlyComponent
        data-testid="ScatterPlotTestId"
        key={id}
        divId={id}
        data={data}
        layout={layout}
        onUpdate={(figure) => {
          internalLayoutRef.current = cloneDeep(figure.layout);
        }}
        config={{ responsive: true, scrollZoom, displayModeBar: false }}
        useResizeHandler
        style={{ width: '100%', height: '100%' }}
      />
    </Stack>
  );
}
