import merge from 'lodash/merge';
import { resolveColumnValues } from '../general/layoutUtils';
import { ColumnInfo, EColumnTypes, ESupportedPlotlyVis, IHeatmapConfig, IVisConfig, VisCategoricalValue, VisColumn, VisNumericalValue } from '../interfaces';

export function isHeatmap(vis: IVisConfig): vis is IHeatmapConfig {
  return vis.type === ESupportedPlotlyVis.HEATMAP;
}

const defaultConfig: IHeatmapConfig = {
  type: ESupportedPlotlyVis.HEATMAP,
  color: null,
  catColumnsSelected: [],
  numColorScaleType: null,
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
