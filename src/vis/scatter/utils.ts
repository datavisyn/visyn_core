import * as d3v7 from 'd3v7';
import flatMap from 'lodash/flatMap';
import groupBy from 'lodash/groupBy';
import merge from 'lodash/merge';
import sortBy from 'lodash/sortBy';
import { i18n } from '../../i18n';
import { getCssValue, selectionColorDark } from '../../utils';
import { VIS_LABEL_COLOR, VIS_NEUTRAL_COLOR } from '../general/constants';
import { columnNameWithDescription, createIdToLabelMapper, resolveColumnValues, resolveSingleColumn, truncateText } from '../general/layoutUtils';
import { getLabelOrUnknown } from '../general/utils';
import {
  ColumnInfo,
  EColumnTypes,
  ENumericalColorScaleType,
  EScatterSelectSettings,
  ESupportedPlotlyVis,
  PlotlyData,
  PlotlyInfo,
  Scales,
  VisCategoricalValue,
  VisColumn,
  VisNumericalColumn,
  VisNumericalValue,
} from '../interfaces';
import { getCol } from '../sidebar';
import { ELabelingOptions, ERegressionLineType, IScatterConfig } from './interfaces';

function calculateDomain(domain: [number | undefined, number | undefined], vals: number[]): [number, number] {
  if (!domain) {
    return null;
  }
  if (domain[0] !== undefined && domain[1] !== undefined) {
    return [domain[0], domain[1]];
  }

  const [min, max] = d3v7.extent(vals as number[]);

  const calcDomain: [number, number] = [domain[0] ? domain[0] : min, domain[1] ? domain[1] : max + max / 20];

  return calcDomain;
}

export const defaultRegressionLineStyle = {
  colors: [VIS_NEUTRAL_COLOR, '#C91A25', '#3561fd'],
  colorSelected: 0,
  width: 2,
  dash: 'solid' as Plotly.Dash,
};

export const defaultConfig: IScatterConfig = {
  type: ESupportedPlotlyVis.SCATTER,
  numColumnsSelected: [],
  facets: null,
  color: null,
  numColorScaleType: ENumericalColorScaleType.SEQUENTIAL,
  shape: null,
  dragMode: EScatterSelectSettings.RECTANGLE,
  alphaSliderVal: 0.5,
  sizeSliderVal: 8,
  showLabels: ELabelingOptions.NEVER,
  showLabelLimit: 50,
  regressionLineOptions: {
    type: ERegressionLineType.NONE,
    fitOptions: { order: 2, precision: 3 },
    lineStyle: defaultRegressionLineStyle,
    showStats: true,
  },
};

export function scatterMergeDefaultConfig(columns: VisColumn[], config: IScatterConfig): IScatterConfig {
  const merged = merge({}, defaultConfig, config);

  const numCols = columns.filter((c) => c.type === EColumnTypes.NUMERICAL);

  if (merged.numColumnsSelected.length === 0 && numCols.length > 1) {
    merged.numColumnsSelected.push(numCols[numCols.length - 1].info);
    merged.numColumnsSelected.push(numCols[numCols.length - 2].info);
  } else if (merged.numColumnsSelected.length === 1 && numCols.length > 1) {
    if (numCols[numCols.length - 1].info.id !== merged.numColumnsSelected[0].id) {
      merged.numColumnsSelected.push(numCols[numCols.length - 1].info);
    } else {
      merged.numColumnsSelected.push(numCols[numCols.length - 2].info);
    }
  }

  return merged;
}

export function moveSelectedToFront(
  col: (VisCategoricalValue | VisNumericalValue)[],
  selectedMap: { [key: string]: boolean },
): (VisCategoricalValue | VisNumericalValue)[] {
  const selectedVals = col.filter((v) => selectedMap[v.id]);
  const remainingVals = col.filter((v) => !selectedMap[v.id]);

  const sortedCol = [...remainingVals, ...selectedVals];

  return sortedCol;
}

export async function createScatterTraces(
  columns: VisColumn[],
  numColumnsSelected: ColumnInfo[],
  labelColumns: ColumnInfo[],
  facet: ColumnInfo,
  shape: ColumnInfo,
  color: ColumnInfo,
  alphaSliderVal: number,
  sizeSliderVal: number,
  colorScaleType: ENumericalColorScaleType,
  scales: Scales,
  shapes: string[] | null,
  showLabels: ELabelingOptions,
  showLabelLimit?: number,
  selectedMap: { [key: string]: boolean } = {},
): Promise<PlotlyInfo> {
  let plotCounter = 1;

  const emptyVal = {
    plots: [],
    legendPlots: [],
    rows: 0,
    cols: 0,
    errorMessage: i18n.t('visyn:vis.scatterError'),
    errorMessageHeader: i18n.t('visyn:vis.errorHeader'),

    formList: ['color', 'shape', 'bubble', 'opacity'],
  };

  if (!numColumnsSelected) {
    return emptyVal;
  }

  const plots: PlotlyData[] = [];
  const legendPlots: PlotlyData[] = [];

  const numCols: VisNumericalColumn[] = numColumnsSelected.map((c) => columns.find((col) => col.info.id === c.id) as VisNumericalColumn);
  const resolvedLabelColumns = await Promise.all((labelColumns ?? []).map((l) => resolveSingleColumn(getCol(columns, l))));
  const resolvedLabelColumnsWithMappedValues = resolvedLabelColumns.map((c) => {
    const mappedValues = new Map();
    c.resolvedValues.forEach((v) => {
      mappedValues.set(v.id, v.val);
    });
    return { ...c, mappedValues };
  });
  const validCols = await resolveColumnValues(numCols);
  const shapeCol = await resolveSingleColumn(getCol(columns, shape));
  const colorCol = await resolveSingleColumn(getCol(columns, color));
  const facetCol = await resolveSingleColumn(getCol(columns, facet));

  // cant currently do 1d scatterplots
  if (validCols.length === 1) {
    return emptyVal;
  }

  const idToLabelMapper = await createIdToLabelMapper(columns);

  const textPositionOptions = ['top center', 'bottom center'];
  const shapeScale = shape
    ? d3v7
        .scaleOrdinal<string>()
        .domain([...new Set(shapeCol.resolvedValues.map((v) => v.val))] as string[])
        .range(shapes)
    : null;

  let min = 0;
  let max = 0;

  if (color) {
    min = d3v7.min(colorCol.resolvedValues.map((v) => +v.val).filter((v) => v !== null));
    max = d3v7.max(colorCol.resolvedValues.map((v) => +v.val).filter((v) => v !== null));
  }

  const textPositions = ['top center', 'bottom center'];
  const numericalColorScale = color
    ? d3v7
        .scaleLinear<string, number>()
        .domain([max, (max + min) / 2, min])
        .range(
          colorScaleType === ENumericalColorScaleType.SEQUENTIAL
            ? [getCssValue('visyn-s9-blue'), getCssValue('visyn-s5-blue'), getCssValue('visyn-s1-blue')]
            : [getCssValue('visyn-c1'), '#d3d3d3', getCssValue('visyn-c2')],
        )
    : null;

  // These are shared data properties between the traces
  const sharedData: Partial<PlotlyData> & { [key: string]: unknown } = {
    showlegend: false,
    type: 'scattergl',
    mode: showLabels === ELabelingOptions.NEVER ? 'markers' : 'text+markers',
    hoverinfo: 'text',
    hoverlabel: {
      bgcolor: 'black',
    },
    selected: {
      marker: {
        line: {
          width: 0,
        },
        opacity: 1,
        size: sizeSliderVal,
      },
      textfont: {
        color: showLabels === ELabelingOptions.NEVER ? 'transparent' : VIS_LABEL_COLOR,
      },
    },
    unselected: {
      marker: {
        line: {
          width: 0,
        },
        color: VIS_NEUTRAL_COLOR,
        opacity: alphaSliderVal,
        size: sizeSliderVal,
      },
      textfont: {
        color: showLabels === ELabelingOptions.ALWAYS ? `rgba(179, 179, 179, ${alphaSliderVal})` : `rgba(179, 179, 179, 0)`,
      },
    },
  };

  // Case: Facetting by category
  if (validCols.length === 2 && facetCol) {
    const xLabel = columnNameWithDescription(validCols[0].info);
    const yLabel = columnNameWithDescription(validCols[1].info);

    const data = validCols[0].resolvedValues.map((v, i) => ({
      x: v.val,
      y: validCols[1].resolvedValues[i].val,
      ids: v.id?.toString(),
      facet: facetCol.resolvedValues[i].val?.toString(),
      color: colorCol ? colorCol.resolvedValues[i].val : undefined,
      shape: shapeCol ? shapeCol.resolvedValues[i].val : undefined,
    }));

    // Sort facets by the order of the domain of the facet column or alphabetically if no domain is set
    const sortOrder =
      (facetCol.domain as string[]) ||
      [...new Set(facetCol.resolvedValues.map((v) => v.val as string))].sort((a, b) => a?.localeCompare(b, undefined, { sensitivity: 'base' }));
    const groupedData = sortBy(groupBy(data, 'facet'), (group) => {
      const facetValue = group[0].facet;
      const index = sortOrder.indexOf(facetValue);
      return index !== -1 ? index : Infinity;
    });

    flatMap(groupedData, (group, key) => {
      const calcXDomain = calculateDomain(
        (validCols[0] as VisNumericalColumn).domain,
        group.map((d) => d.x as number),
      );
      const calcYDomain = calculateDomain(
        (validCols[1] as VisNumericalColumn).domain,
        group.map((d) => d.y as number),
      );

      plots.push({
        data: {
          x: group.map((d) => d.x as number),
          y: group.map((d) => d.y as number),
          ids: group.map((d) => d.ids),
          xaxis: plotCounter === 1 ? 'x' : `x${plotCounter}`,
          yaxis: plotCounter === 1 ? 'y' : `y${plotCounter}`,
          hovertext: group.map((d) =>
            `${idToLabelMapper(d.ids)}
            <br />${xLabel}: ${d.x}
            <br />${yLabel}: ${d.y}
            ${(resolvedLabelColumnsWithMappedValues ?? []).map((l) => `<br />${columnNameWithDescription(l.info)}: ${getLabelOrUnknown(l.mappedValues.get(d.ids))}`)}
            ${colorCol ? `<br />${columnNameWithDescription(colorCol.info)}: ${getLabelOrUnknown(d.color)}` : ''}
            ${shapeCol && shapeCol.info.id !== colorCol?.info.id ? `<br />${columnNameWithDescription(shapeCol.info)}: ${getLabelOrUnknown(d.shape)}` : ''}`.trim(),
          ),
          text: group.map((d) => idToLabelMapper(d.ids)),
          // @ts-ignore
          textposition: group.map((d, i) => textPositionOptions[i % textPositionOptions.length]),
          marker: {
            symbol: shapeCol ? group.map((d) => shapeScale(d.shape as string)) : 'circle',
            color: colorCol
              ? group.map((d) =>
                  colorCol.type === EColumnTypes.NUMERICAL
                    ? numericalColorScale(d.color as number)
                    : colorCol.color
                      ? colorCol.color[d.color]
                      : scales.color(d.color),
                )
              : selectionColorDark,
          },
          ...sharedData,
        },
        xLabel,
        yLabel,
        xDomain: calcXDomain,
        yDomain: calcYDomain,
        title: getLabelOrUnknown(group[0].facet),
      });
      plotCounter += 1;
    });
  }

  // Case: Exactly two numerical columns
  if (validCols.length === 2 && !facetCol) {
    const xDataVals = validCols[0].resolvedValues.map((v) => v.val) as number[];
    const yDataVals = validCols[1].resolvedValues.map((v) => v.val) as number[];
    const xLabel = columnNameWithDescription(validCols[0].info);
    const yLabel = columnNameWithDescription(validCols[1].info);

    const calcXDomain = calculateDomain((validCols[0] as VisNumericalColumn).domain, xDataVals);
    const calcYDomain = calculateDomain((validCols[1] as VisNumericalColumn).domain, yDataVals);

    plots.push({
      data: {
        x: xDataVals,
        y: yDataVals,
        ids: validCols[0].resolvedValues.map((v) => v.id?.toString()),
        xaxis: plotCounter === 1 ? 'x' : `x${plotCounter}`,
        yaxis: plotCounter === 1 ? 'y' : `y${plotCounter}`,
        hovertext: validCols[0].resolvedValues.map((v, i) =>
          `${idToLabelMapper(v.id)}
<br />${xLabel}: ${v.val}
<br />${yLabel}: ${yDataVals[i]}
${(resolvedLabelColumns ?? []).map((l) => `<br />${columnNameWithDescription(l.info)}: ${getLabelOrUnknown(l.resolvedValues[i].val)}`)}
${colorCol ? `<br />${columnNameWithDescription(colorCol.info)}: ${getLabelOrUnknown(colorCol.resolvedValues[i].val)}` : ''}
${shapeCol && shapeCol.info.id !== colorCol?.info.id ? `<br />${columnNameWithDescription(shapeCol.info)}: ${getLabelOrUnknown(shapeCol.resolvedValues[i].val)}` : ''}`.trim(),
        ),
        text: validCols[0].resolvedValues.map((v) => idToLabelMapper(v.id)),
        // @ts-ignore
        textposition: validCols[0].resolvedValues.map((v, i) => textPositionOptions[i % textPositionOptions.length]),
        marker: {
          symbol: shapeCol ? shapeCol.resolvedValues.map((v) => shapeScale(v.val as string)) : 'circle',

          color: colorCol
            ? colorCol.resolvedValues.map((v) =>
                colorCol.type === EColumnTypes.NUMERICAL ? numericalColorScale(v.val as number) : colorCol.color ? colorCol.color[v.val] : scales.color(v.val),
              )
            : selectionColorDark,
        },
        ...sharedData,
      },
      xLabel,
      yLabel,
      xDomain: calcXDomain,
      yDomain: calcYDomain,
    });
  }

  // Case: Multiple numerical columns and no categorical facetting
  if (validCols.length > 2 && !facetCol) {
    validCols.forEach((yCurr, yIdx) => {
      validCols.forEach((xCurr) => {
        // if on the diagonal, make a histogram.
        if (xCurr.info.id === yCurr.info.id) {
          const ids = xCurr.resolvedValues.map((v) => v.id?.toString());
          plots.push({
            data: {
              x: xCurr.resolvedValues.map((v) => v.val),
              customdata: ids, // had to use customdata instead of ids because otherwise binning would not work
              xaxis: plotCounter === 1 ? 'x' : `x${plotCounter}`,
              yaxis: plotCounter === 1 ? 'y' : `y${plotCounter}`,
              type: 'histogram',
              hoverlabel: {
                namelength: 5,
              },
              showlegend: false,
              marker: {
                color: VIS_NEUTRAL_COLOR,
              },
              // @ts-ignore
              selected: {
                marker: {
                  opacity: 1,
                  color: selectionColorDark,
                },
              },
              unselected: {
                marker: {
                  opacity: alphaSliderVal,
                },
              },
              selectedpoints: ids.reduce((acc, id, i) => (selectedMap[id] ? acc.concat(i) : acc), [] as number[]),
            },
            xLabel: plotCounter > validCols.length * (validCols.length - 1) ? columnNameWithDescription(xCurr.info) : null,
            yLabel: plotCounter === 1 + validCols.length * yIdx ? columnNameWithDescription(yCurr.info) : null,
          });
          // otherwise, make a scatterplot
        } else {
          const xDataVals = xCurr.resolvedValues.map((v) => v.val);
          const yDataVals = yCurr.resolvedValues.map((v) => v.val);

          const xLabel = columnNameWithDescription(xCurr.info);
          const yLabel = columnNameWithDescription(yCurr.info);

          const calcXDomain = calculateDomain((xCurr as VisNumericalColumn).domain, xDataVals as number[]);
          const calcYDomain = calculateDomain((yCurr as VisNumericalColumn).domain, yDataVals as number[]);

          plots.push({
            data: {
              x: xDataVals,
              y: yDataVals,
              ids: xCurr.resolvedValues.map((v) => v.id?.toString()),
              xaxis: plotCounter === 1 ? 'x' : `x${plotCounter}`,
              yaxis: plotCounter === 1 ? 'y' : `y${plotCounter}`,
              hovertext: xCurr.resolvedValues.map((v, i) =>
                `${v.id}
<br />${xLabel}: ${v.val}
<br />${yLabel}: ${yCurr.resolvedValues[i].val}
${(resolvedLabelColumns ?? []).map((l) => `<br />${columnNameWithDescription(l.info)}: ${getLabelOrUnknown(l.resolvedValues[i].val)}`)}
${colorCol ? `<br />${columnNameWithDescription(colorCol.info)}: ${getLabelOrUnknown(colorCol.resolvedValues[i].val)}` : ''}
${shapeCol && shapeCol.info.id !== colorCol?.info.id ? `<br />${columnNameWithDescription(shapeCol.info)}: ${getLabelOrUnknown(shapeCol.resolvedValues[i].val)}` : ''}`.trim(),
              ),
              text: validCols[0].resolvedValues.map((v) => idToLabelMapper(v.id)),
              // @ts-ignore
              textposition: validCols[0].resolvedValues.map((v, i) => (i % textPositions.length === 0 ? 'top center' : 'bottom center')),
              marker: {
                color: colorCol
                  ? colorCol.resolvedValues.map((v) =>
                      colorCol.type === EColumnTypes.NUMERICAL
                        ? numericalColorScale(v.val as number)
                        : colorCol.color
                          ? colorCol.color[v.val]
                          : scales.color(v.val),
                    )
                  : selectionColorDark,
              },
              ...sharedData,
            },
            xLabel: plotCounter > validCols.length * (validCols.length - 1) ? xLabel : null,
            yLabel: plotCounter === 1 + validCols.length * yIdx ? yLabel : null,
            xDomain: calcXDomain,
            yDomain: calcYDomain,
          });
        }

        plotCounter += 1;
      });
    });
  }

  // if we have a column for the color, and its a categorical column, add a legendPlot that creates a legend.
  if (colorCol && colorCol.type === EColumnTypes.CATEGORICAL && validCols.length > 0) {
    legendPlots.push({
      data: {
        x: [null],
        y: [null],
        type: 'scattergl',
        mode: 'markers',
        legendgroup: 'color',
        hoverinfo: 'skip',

        // @ts-ignore
        legendgrouptitle: {
          text: truncateText(colorCol.info.name, true, 20),
        },
        marker: {
          line: {
            width: 0,
          },
          symbol: 'circle',
          size: sizeSliderVal,
          color: colorCol ? colorCol.resolvedValues.map((v) => (colorCol.color ? colorCol.color[v.val] : scales.color(v.val))) : VIS_NEUTRAL_COLOR,
          opacity: 1,
        },
        transforms: [
          {
            type: 'groupby',
            groups: colorCol.resolvedValues.map((v) => getLabelOrUnknown(v.val)),
            styles: [
              ...[...new Set<string>(colorCol.resolvedValues.map((v) => getLabelOrUnknown(v.val)))].map((c) => {
                return { target: c, value: { name: c } };
              }),
            ],
          },
        ],
      },
      xLabel: null,
      yLabel: null,
    });
  }

  // if we have a column for the shape, add a legendPlot that creates a legend.
  if (shapeCol) {
    legendPlots.push({
      data: {
        x: [null],
        y: [null],
        type: 'scattergl',
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
          text: truncateText(shapeCol.info.name, true, 20),
        },
        marker: {
          line: {
            width: 0,
          },
          opacity: alphaSliderVal,
          size: sizeSliderVal,
          symbol: shapeCol ? shapeCol.resolvedValues.map((v) => shapeScale(v.val as string)) : 'circle',
          color: VIS_NEUTRAL_COLOR,
        },
        transforms: [
          {
            type: 'groupby',
            groups: shapeCol.resolvedValues.map((v) => getLabelOrUnknown(v.val)),
            styles: [
              ...[...new Set<string>(shapeCol.resolvedValues.map((v) => getLabelOrUnknown(v.val)))].map((c) => {
                return { target: c, value: { name: c } };
              }),
            ],
          },
        ],
      },
      xLabel: null,
      yLabel: null,
    });
  }

  const defaultColNum = Math.min(Math.ceil(Math.sqrt(plots.length)), 5);

  return {
    plots,
    legendPlots,
    rows: facetCol ? Math.ceil(plots.length / defaultColNum) : Math.sqrt(plots.length),
    cols: facetCol ? defaultColNum : Math.sqrt(plots.length),
    errorMessage: i18n.t('visyn:vis.scatterError'),
    errorMessageHeader: i18n.t('visyn:vis.errorHeader'),
  };
}
