import { bin as d3Bin, extent, max, min } from 'd3v7';
import merge from 'lodash/merge';
import { NAN_REPLACEMENT } from '../general';
import { resolveSingleColumn } from '../general/layoutUtils';
import { ColumnInfo, EColumnTypes, VisCategoricalValue, VisColumn, VisNumericalValue } from '../interfaces';
import { defaultConfig, IBarConfig } from './interfaces';

export function barMergeDefaultConfig(columns: VisColumn[], config: IBarConfig): IBarConfig {
  const merged = merge({}, defaultConfig, config);

  const catCols = columns.filter((c) => c.type === EColumnTypes.CATEGORICAL);
  const numCols = columns.filter((c) => c.type === EColumnTypes.NUMERICAL);

  if (!merged.catColumnSelected && catCols.length > 0) {
    merged.catColumnSelected = catCols[catCols.length - 1]?.info as ColumnInfo;
  }

  if (!merged.aggregateColumn && numCols.length > 0) {
    merged.aggregateColumn = numCols[numCols.length - 1]?.info as ColumnInfo;
  }

  return merged;
}

/**
 * Creates a bin lookup map based on the provided data and maximum number of bins.
 *
 * @param data - The array of VisNumericalValue objects.
 * @param maxBins - The maximum number of bins (default: 8).
 * @returns A Map object with VisNumericalValue keys and string values representing the bin names.
 */
export const createBinLookup = (data: VisNumericalValue[], maxBins: number = 8): Map<VisNumericalValue, string> => {
  // Separate null values from the data
  const nonNullData = data.filter((row) => row.val !== null);
  const nullData = data.filter((row) => row.val === null);

  // Extract the numerical values from non-null data
  const values = nonNullData.map((row) => row.val as number);

  // Create the bins using d3.bin
  const bins = d3Bin<number, number>()
    .domain(extent(values) as [number, number])
    .thresholds(maxBins)(values);

  // Create a map to hold the bin names
  const binMap = new Map<VisNumericalValue, string>();

  // Map bins to our desired structure with names and filter out empty bins
  bins
    .filter((bin) => bin.length > 0) // Filter out empty bins
    .forEach((bin) => {
      const binName = `${min(bin)} to ${max(bin)}`;
      const binRows = nonNullData.filter((row) => bin.includes(row.val as number));
      binRows.forEach((row) => {
        binMap.set(row, binName);
      });
    });

  // Add a separate bin for null values
  if (nullData.length > 0) {
    nullData.forEach((row) => {
      binMap.set(row, NAN_REPLACEMENT);
    });
  }

  return binMap;
};

export async function getBarData(
  columns: VisColumn[],
  catColumn: ColumnInfo,
  groupColumn: ColumnInfo | null,
  facetsColumn: ColumnInfo | null,
  aggregateColumn: ColumnInfo | null,
): Promise<{
  catColVals: {
    resolvedValues: (VisNumericalValue | VisCategoricalValue)[];
    type: EColumnTypes.NUMERICAL | EColumnTypes.CATEGORICAL;
    info: ColumnInfo;
  };
  groupColVals: {
    resolvedValues: (VisNumericalValue | VisCategoricalValue)[];
    type: EColumnTypes.NUMERICAL | EColumnTypes.CATEGORICAL;
    info: ColumnInfo;
    color?: Record<string, string>;
  };
  facetsColVals: {
    resolvedValues: (VisNumericalValue | VisCategoricalValue)[];
    type: EColumnTypes.NUMERICAL | EColumnTypes.CATEGORICAL;
    info: ColumnInfo;
  };
  aggregateColVals: {
    resolvedValues: (VisNumericalValue | VisCategoricalValue)[];
    type: EColumnTypes.NUMERICAL | EColumnTypes.CATEGORICAL;
    info: ColumnInfo;
  };
}> {
  const catColVals = await resolveSingleColumn(columns.find((col) => col.info.id === catColumn.id)!);

  const groupColVals = await resolveSingleColumn(groupColumn ? columns.find((col) => col.info.id === groupColumn.id)! : null);
  const facetsColVals = await resolveSingleColumn(facetsColumn ? columns.find((col) => col.info.id === facetsColumn.id)! : null);
  const aggregateColVals = await resolveSingleColumn(aggregateColumn ? columns.find((col) => col.info.id === aggregateColumn.id)! : null);

  // NOTE: @dv-usama-ansari: disable strict mode here.
  // @ts-expect-error: TS2322
  return { catColVals, groupColVals, facetsColVals, aggregateColVals };
}
