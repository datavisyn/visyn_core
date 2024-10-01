import lodashMax from 'lodash/max';
import merge from 'lodash/merge';
import lodashMin from 'lodash/min';
import range from 'lodash/range';
import { NAN_REPLACEMENT } from '../../general';
import { resolveSingleColumn } from '../../general/layoutUtils';
import { BaseVisConfig, ColumnInfo, EColumnTypes, ESupportedPlotlyVis, VisCategoricalValue, VisColumn, VisNumericalValue } from '../../interfaces';
import { defaultConfig, IBarConfig, VisColumnWithResolvedValues } from '../interfaces';

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

function binValues(values: number[], numberOfBins: number) {
  const min = lodashMin(values) || 0;
  const max = lodashMax(values) || 1;
  const binSize = (max - min) / numberOfBins;

  // Create bins
  const bins = range(0, numberOfBins).map((i) => {
    const lowerBound = min + i * binSize;
    const upperBound = lowerBound + binSize;
    return {
      range: [lowerBound, upperBound],
      values: values.filter((value) => value >= lowerBound && value < upperBound),
    };
  });

  return bins;
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

  // Create the bins using custom lodash function
  const bins = binValues(values, maxBins);

  // Create a map to hold the bin names
  const binMap = new Map<VisNumericalValue, string>();

  // Map bins to our desired structure with names and filter out empty bins
  bins
    .filter((bin) => bin.values.length > 0) // Filter out empty bins
    .forEach((bin) => {
      const binName = `${bin.range[0]} to ${bin.range[1]}`;
      const binRows = nonNullData.filter((row) => bin.values.includes(row.val as number));
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
  const catColVals = (await resolveSingleColumn(columns.find((col) => col.info.id === catColumn.id)!)) as VisColumnWithResolvedValues;

  const groupColVals = (await resolveSingleColumn(groupColumn ? columns.find((col) => col.info.id === groupColumn.id)! : null)) as VisColumnWithResolvedValues;
  const facetsColVals = (await resolveSingleColumn(
    facetsColumn ? columns.find((col) => col.info.id === facetsColumn.id)! : null,
  )) as VisColumnWithResolvedValues;
  const aggregateColVals = (await resolveSingleColumn(
    aggregateColumn ? columns.find((col) => col.info.id === aggregateColumn.id)! : null,
  )) as VisColumnWithResolvedValues;

  return { catColVals, groupColVals, facetsColVals, aggregateColVals };
}

export function isBarConfig(s: BaseVisConfig): s is IBarConfig {
  return s.type === ESupportedPlotlyVis.BAR;
}
