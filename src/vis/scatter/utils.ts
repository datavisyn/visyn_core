import * as d3v7 from 'd3v7';
import merge from 'lodash/merge';
import { VIS_NEUTRAL_COLOR } from '../general/constants';
import {
  ColumnInfo,
  EColumnTypes,
  ENumericalColorScaleType,
  EScatterSelectSettings,
  ESupportedPlotlyVis,
  VisCategoricalValue,
  VisColumn,
  VisNumericalColumn,
  VisNumericalValue,
} from '../interfaces';
import { ELabelingOptions, ERegressionLineType, IRegressionResult, IScatterConfig } from './interfaces';
import { PlotlyTypes } from '../../plotly';
import { createIdToLabelMapper, resolveColumnValues, resolveSingleColumn } from '../general/layoutUtils';
import { getCol } from '../sidebar';

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
  subplots: undefined,
  showLabels: ELabelingOptions.NEVER,
  showLabelLimit: 50,
  regressionLineOptions: {
    type: ERegressionLineType.NONE,
    fitOptions: { order: 2, precision: 3 },
    lineStyle: defaultRegressionLineStyle,
    showStats: true,
  },
  xAxisType: 'linear',
  yAxisType: 'linear',
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

export type ResolvedVisColumn = VisColumn & { resolvedValues: (VisNumericalValue | VisCategoricalValue)[] };

export type FetchColumnDataResult = {
  validColumns: ResolvedVisColumn[];
  shapeColumn: ResolvedVisColumn;
  colorColumn: ResolvedVisColumn;
  facetColumn: ResolvedVisColumn;
  colorDomain: [number, number];
  idToLabelMapper: (id: string) => string;
  resolvedLabelColumns: ResolvedVisColumn[];
  resolvedLabelColumnsWithMappedValues: (ResolvedVisColumn & { mappedValues: Map<any, any> })[];
  subplots?: { xColumn: ResolvedVisColumn; yColumn: ResolvedVisColumn; title: string }[];
};

/**
 * Data model hook for scatter plot
 */
export async function fetchColumnData(
  columns: VisColumn[],
  numericalColumnsSelected: ColumnInfo[],
  labelColumns: ColumnInfo[],
  subplots: { xColumn: ColumnInfo; yColumn: ColumnInfo; title: string }[],
  color: ColumnInfo,
  shape: ColumnInfo,
  facet: ColumnInfo,
): Promise<FetchColumnDataResult> {
  const numCols: VisNumericalColumn[] = numericalColumnsSelected.map((c) => columns.find((col) => col.info.id === c.id) as VisNumericalColumn);
  const validColumns = await resolveColumnValues(numCols);

  const shapeColumn = await resolveSingleColumn(getCol(columns, shape));
  const colorColumn = await resolveSingleColumn(getCol(columns, color));
  const facetColumn = await resolveSingleColumn(getCol(columns, facet));

  const resolvedLabelColumns = await Promise.all((labelColumns ?? []).map((l) => resolveSingleColumn(getCol(columns, l))));

  let min = 0;
  let max = 0;

  if (colorColumn) {
    min = d3v7.min(colorColumn.resolvedValues.map((v) => +v.val).filter((v) => v !== null));
    max = d3v7.max(colorColumn.resolvedValues.map((v) => +v.val).filter((v) => v !== null));
  }

  // Resolve subplots columns all at once to types of [{ resolvedX, resolvedY, title }]
  const resolvedSubplots = subplots
    ? await Promise.all(
        subplots
          .map(async (subplot) => {
            const xColumn: ResolvedVisColumn | null = await resolveSingleColumn(getCol(columns, subplot.xColumn));
            const yColumn: ResolvedVisColumn | null = await resolveSingleColumn(getCol(columns, subplot.yColumn));

            if (!xColumn || !yColumn) {
              return null;
            }

            return { xColumn, yColumn, title: subplot.title };
          })
          .filter((s) => s !== null) as unknown as { xColumn: ResolvedVisColumn; yColumn: ResolvedVisColumn; title: string }[],
      )
    : undefined;

  const idToLabelMapper = await createIdToLabelMapper(columns);
  const resolvedLabelColumnsWithMappedValues = resolvedLabelColumns.map((c) => {
    const mappedValues = new Map();
    c.resolvedValues.forEach((v) => {
      mappedValues.set(v.id, v.val);
    });
    return { ...c, mappedValues };
  });

  return {
    validColumns,
    shapeColumn,
    colorColumn,
    facetColumn,
    colorDomain: [min, max],
    idToLabelMapper,
    resolvedLabelColumns,
    resolvedLabelColumnsWithMappedValues,
    subplots: resolvedSubplots,
  };
}

export function regressionToAnnotation(r: IRegressionResult, precision: number, xref: string, yref: string): Partial<PlotlyTypes.Annotations> {
  const formatPValue = (pValue: number) => {
    if (pValue === null) {
      return '';
    }
    if (pValue < 0.001) {
      return `<i>(P<.001)</i>`;
    }
    return `<i>(P=${pValue.toFixed(3).toString().replace(/^0+/, '')})</i>`;
  };

  const statsFormatted = [
    `n: ${r.stats.n}`,
    `R²: ${r.stats.r2 < 0.001 ? '<0.001' : r.stats.r2} ${formatPValue(r.stats.pValue)}`,
    `Pearson: ${r.stats.pearsonRho?.toFixed(precision)}`,
    `Spearman: ${r.stats.spearmanRho?.toFixed(precision)}`,
  ];

  return {
    x: 0.0,
    y: 1.0,
    xref: `${xref} domain` as PlotlyTypes.XAxisName,
    yref: `${yref} domain` as PlotlyTypes.YAxisName,
    text: statsFormatted.map((row) => `${row}`).join('<br>'),
    showarrow: false,
    font: {
      family: 'Roboto, sans-serif',
      size: 13.4,
      color: '#99A1A9',
    },
    align: 'left',
    xanchor: 'left',
    yanchor: 'top',
    bgcolor: 'rgba(255, 255, 255, 0.8)',
    xshift: 10,
    yshift: -5,
  };
}
