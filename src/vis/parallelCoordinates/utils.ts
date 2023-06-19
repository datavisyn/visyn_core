import { merge } from 'lodash';
import {
  ColumnInfo,
  EColumnTypes,
  ENumericalColorScaleType,
  EScatterSelectSettings,
  ESupportedPlotlyVis,
  IParallelCoordinatesConfig,
  IScatterConfig,
  IVisConfig,
  VisCategoricalColumn,
  VisCategoricalValue,
  VisColumn,
  VisNumericalColumn,
  VisNumericalValue,
} from '../interfaces';
import { resolveColumnValues } from '../general/layoutUtils';

export function isParallelCoordinates(s: IVisConfig): s is IParallelCoordinatesConfig {
  return s.type === ESupportedPlotlyVis.PARALLEL_COORDINATES;
}

const defaultConfig: IParallelCoordinatesConfig = {
  type: ESupportedPlotlyVis.PARALLEL_COORDINATES,
  numColumnsSelected: [],
  catColumnsSelected: [],
  color: null,
};

export function parallelCoordinatesMergeDefaultConfig(columns: VisColumn[], config: IScatterConfig): IVisConfig {
  const merged = merge({}, defaultConfig, config);

  return merged;
}

export async function getParallelData(
  columns: VisColumn[],
  numColumnsSelected: ColumnInfo[],
  catColumnsSelected: ColumnInfo[],
): Promise<{
  numColVals: {
    resolvedValues: (VisNumericalValue | VisCategoricalValue)[]; // this is a workaround for the types
    type: EColumnTypes.NUMERICAL | EColumnTypes.CATEGORICAL;
    info: ColumnInfo;
  }[];
  catColVals: {
    resolvedValues: (VisCategoricalValue | VisNumericalValue)[]; // this is a workaround for the types
    type: EColumnTypes.NUMERICAL | EColumnTypes.CATEGORICAL;
    info: ColumnInfo;
  }[];
}> {
  const numCols: VisNumericalColumn[] = numColumnsSelected.map((col) => columns.find((c) => c.info.id === col.id)) as VisNumericalColumn[];
  const catCols: VisCategoricalColumn[] = catColumnsSelected.map((col) => columns.find((c) => c.info.id === col.id)) as VisCategoricalColumn[];

  const numColVals = await resolveColumnValues(numCols);
  const catColVals = await resolveColumnValues(catCols);
  console.log(numColVals);
  // const colorColVals = await resolveSingleColumn(colorColumn ? columns.find((col) => col.info.id === colorColumn.id) : null);

  return { numColVals, catColVals };
}
