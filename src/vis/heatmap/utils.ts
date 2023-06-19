import merge from 'lodash/merge';
import { IVisConfig, IHeatmapConfig, ESupportedPlotlyVis, VisColumn, EColumnTypes, ColumnInfo, VisNumericalValue, VisCategoricalValue } from '../interfaces';
import { resolveColumnValues, resolveSingleColumn } from '../general/layoutUtils';

export function isHeatmap(vis: IVisConfig): vis is IHeatmapConfig {
  return vis.type === ESupportedPlotlyVis.HEATMAP;
}

const defaultConfig: IHeatmapConfig = {
  type: ESupportedPlotlyVis.HEATMAP,
  colorScale: null,
  catColumnsSelected: [],
};

export function heatmapMergeDefaultConfig(columns: VisColumn[], config: IHeatmapConfig): IVisConfig {
  const merged = merge({}, defaultConfig, config);
  return merged;
}

export async function getHeatmapData(
  columns: VisColumn[],
  catColumnDesc: ColumnInfo[],
): Promise<{
  catColumn: {
    resolvedValues: (VisNumericalValue | VisCategoricalValue)[];
    type: EColumnTypes.NUMERICAL | EColumnTypes.CATEGORICAL;
    info: ColumnInfo;
  }[];
}> {
  const catColumn = await resolveColumnValues(columns.filter((col) => catColumnDesc.find((catCol) => catCol.id === col.info.id)));

  return { catColumn };
}
