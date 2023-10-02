import merge from 'lodash/merge';
import { resolveColumnValues, resolveSingleColumn } from '../general/layoutUtils';
import {
  ColumnInfo,
  EAggregateTypes,
  EColumnTypes,
  ENumericalColorScaleType,
  ESupportedPlotlyVis,
  VisCategoricalValue,
  VisColumn,
  VisNumericalValue,
} from '../interfaces';
import { ESortTypes, IHeatmapConfig } from './interfaces';

const defaultConfig: IHeatmapConfig = {
  type: ESupportedPlotlyVis.HEATMAP,
  color: null,
  catColumnsSelected: [],
  numColorScaleType: ENumericalColorScaleType.SEQUENTIAL,
  xSortedBy: ESortTypes.CAT_ASC,
  ySortedBy: ESortTypes.CAT_ASC,
  aggregateColumn: null,
  aggregateType: EAggregateTypes.COUNT,
  isAnimationEnabled: false,
};

export function heatmapMergeDefaultConfig(columns: VisColumn[], config: IHeatmapConfig): IHeatmapConfig {
  const merged = merge({}, defaultConfig, config);
  return merged;
}

export async function getHeatmapData(
  columns: VisColumn[],
  catColumnDesc: ColumnInfo[],
  aggColumnDesc: ColumnInfo,
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
}> {
  const catColumn = await resolveColumnValues(columns.filter((col) => catColumnDesc.find((catCol) => catCol.id === col.info.id)));
  const aggregateColumn = await resolveSingleColumn(aggColumnDesc ? columns.find((col) => col.info.id === aggColumnDesc.id) : null);

  return { catColumn, aggregateColumn };
}
