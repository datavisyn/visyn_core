import lodashMax from 'lodash/max';
import lodashMin from 'lodash/min';
import range from 'lodash/range';
import { NAN_REPLACEMENT } from '../../../../general';
import { VisNumericalValue } from '../../../../interfaces';

function binValues(values: number[], numberOfBins: number) {
  const min = lodashMin(values) || 0;
  const max = lodashMax(values) || 1;
  const binSize = (max - min) / numberOfBins;

  if (min === max) {
    return [{ range: [min, max], values }];
  }

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
 * @param binCount - The maximum number of bins (default: 8).
 * @returns A Map object with VisNumericalValue keys and string values representing the bin names.
 */
export const createBinLookup = (data: VisNumericalValue[], binCount: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 = 8): Map<VisNumericalValue, string> => {
  // Separate null values from the data
  const nonNullData = data.filter((row) => row.val !== null);
  const nullData = data.filter((row) => row.val === null);

  // Extract the numerical values from non-null data
  const values = nonNullData.map((row) => row.val as number);

  // Create the bins using custom lodash function
  const bins = binValues(values, Math.min(binCount, 8));

  // Create a map to hold the bin names
  const binMap = new Map<VisNumericalValue, string>();

  // Map bins to our desired structure with names and filter out empty bins
  bins
    .filter((bin) => bin.values.length > 0) // Filter out empty bins
    .forEach((bin) => {
      const [min, max] = bin.range;
      const binName = min === max ? `${min || max}` : `${bin.range[0]} to ${bin.range[1]}`;
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
