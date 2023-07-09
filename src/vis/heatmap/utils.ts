import merge from 'lodash/merge';
import { resolveColumnValues, resolveSingleColumn } from '../general/layoutUtils';
import {
  ColumnInfo,
  EAggregateTypes,
  EColumnTypes,
  ESortTypes,
  ESupportedPlotlyVis,
  IHeatmapConfig,
  IVisConfig,
  VisCategoricalValue,
  VisColumn,
  VisNumericalValue,
} from '../interfaces';

export function isHeatmap(vis: IVisConfig): vis is IHeatmapConfig {
  return vis.type === ESupportedPlotlyVis.HEATMAP;
}

const defaultConfig: IHeatmapConfig = {
  type: ESupportedPlotlyVis.HEATMAP,
  color: null,
  catColumnsSelected: [],
  numColorScaleType: null,
  sortedBy: ESortTypes.CAT_ASC,
  aggregateColumn: null,
  aggregateType: EAggregateTypes.COUNT,
  sizeAggregateType: EAggregateTypes.COUNT,
  sizeColumn: null,
};

export function heatmapMergeDefaultConfig(columns: VisColumn[], config: IHeatmapConfig): IVisConfig {
  const merged = merge({}, defaultConfig, config);
  return merged;
}

export async function getHeatmapData(
  columns: VisColumn[],
  catColumnDesc: ColumnInfo[],
  aggColumnDesc: ColumnInfo,
  sizeColumnDesc: ColumnInfo,
): Promise<{
  catColumn: {
    resolvedValues: (VisNumericalValue | VisCategoricalValue)[];
    type: EColumnTypes.NUMERICAL | EColumnTypes.CATEGORICAL;
    info: ColumnInfo;
  }[];
  aggregateColumn: {
    resolvedValues: (VisNumericalValue | VisCategoricalValue)[];
    type: EColumnTypes.NUMERICAL | EColumnTypes.CATEGORICAL;
    info: ColumnInfo;
  };
  sizeColumn: {
    resolvedValues: (VisNumericalValue | VisCategoricalValue)[];
    type: EColumnTypes.NUMERICAL | EColumnTypes.CATEGORICAL;
    info: ColumnInfo;
  };
}> {
  const catColumn = await resolveColumnValues(columns.filter((col) => catColumnDesc.find((catCol) => catCol.id === col.info.id)));
  const aggregateColumn = await resolveSingleColumn(aggColumnDesc ? columns.find((col) => col.info.id === aggColumnDesc.id) : null);
  const sizeColumn = await resolveSingleColumn(sizeColumnDesc ? columns.find((col) => col.info.id === sizeColumnDesc.id) : null);

  return { catColumn, aggregateColumn, sizeColumn };
}
