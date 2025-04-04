import { op } from 'arquero';
import ColumnTable from 'arquero/dist/types/table/column-table';
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
  xSortedBy: ESortTypes.NONE,
  ySortedBy: ESortTypes.NONE,
  aggregateColumn: null,
  aggregateType: EAggregateTypes.COUNT,
  isAnimationEnabled: false,
};

export function heatmapMergeDefaultConfig(columns: VisColumn[], config: IHeatmapConfig): IHeatmapConfig {
  const merged = merge({}, defaultConfig, config);
  return merged;
}

// Helper function for the bar chart which rolls up the data depending on the aggregate type.
// Mostly just code duplication with the different aggregate types.
export function rollupByAggregateType(tempTable: ColumnTable, aggregateType: EAggregateTypes) {
  switch (aggregateType) {
    case EAggregateTypes.COUNT:
      return tempTable.rollup({ aggregateVal: () => op.count() });
    case EAggregateTypes.AVG:
      return tempTable.rollup({ aggregateVal: (d) => op.average(d.aggregateVal) });

    case EAggregateTypes.MIN:
      return tempTable.rollup({ aggregateVal: (d) => op.min(d.aggregateVal) });

    case EAggregateTypes.MED:
      return tempTable.rollup({ aggregateVal: (d) => op.median(d.aggregateVal) });
    case EAggregateTypes.MAX:
      return tempTable.rollup({ aggregateVal: (d) => op.max(d.aggregateVal) });

    default:
      return null;
  }
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
