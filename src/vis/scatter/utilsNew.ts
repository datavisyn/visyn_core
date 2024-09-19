import * as d3v7 from 'd3v7';
import { createIdToLabelMapper, resolveColumnValues, resolveSingleColumn } from '../general';
import { VisColumn, ColumnInfo, VisNumericalColumn, VisNumericalValue, VisCategoricalValue } from '../interfaces';
import { getCol } from '../sidebar';

export type ResolvedVisColumn = VisColumn & { resolvedValues: (VisNumericalValue | VisCategoricalValue)[] };

export function calculateDomain(domain: [number, number] | [undefined, undefined], vals: number[]): [number, number] {
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

/**
 * Data model hook for scatter plot
 */
export async function fetchColumnData(
  columns: VisColumn[],
  numericalColumnsSelected: ColumnInfo[],
  labelColumns: ColumnInfo[],
  color: ColumnInfo,
  shape: ColumnInfo,
  facet: ColumnInfo,
): Promise<{
  validColumns: ResolvedVisColumn[];
  shapeColumn: ResolvedVisColumn;
  colorColumn: ResolvedVisColumn;
  facetColumn: ResolvedVisColumn;
  colorDomain: [number, number];
  idToLabelMapper: (id: string) => string;
  resolvedLabelColumns: ResolvedVisColumn[];
  resolvedLabelColumnsWithMappedValues: (ResolvedVisColumn & { mappedValues: Map<any, any> })[];
}> {
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
  };
}
