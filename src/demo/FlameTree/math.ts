import { nanoid } from '@reduxjs/toolkit';
import { ticks } from 'd3v7';
import isNumber from 'lodash/isNumber';

import { m4 } from '../../vis/vishooks/math';
import mean from 'lodash/mean';
import max from 'lodash/max';
import min from 'lodash/min';
import sortBy from 'lodash/sortBy';

export function isNumerical<T>(data: T[]) {
  return !data.some((datum) => !isNumber(datum) && datum !== null && datum !== undefined);
}

export function isCategorical<T>(data: T[]) {
  return !data.some((datum) => typeof datum !== 'string' && datum !== null && datum !== undefined);
}

export type Row = Record<string, unknown>;

export type NumericalBin<T extends Record<string, unknown>> = {
  /**
   * The unique identifier for the bin.
   */
  id: string;

  /**
   * The parent bin id.
   */
  parent?: string;

  /**
   * The children of the bin.
   */
  children: string[];

  /**
   * The label for the bin which is displayed.
   */
  label: string;

  /**
   * The start of the bin, in absolute range coordinates.
   */
  x0: number;

  /**
   * The end of the bin, in absolute range coordinates.
   */
  x1: number;

  /**
   * The level of the bin in the hierarchy.
   */
  y: number;

  /**
   * The items in the bin.
   */
  items: Row[];

  /**
   * A function that checks if an entry is contained in the bin.
   */
  contains: (entry: Row) => boolean;

  // @TODO move this to a key or so
  value: T;
};

export type CategoricalBin<T extends Record<string, unknown>> = {
  /**
   * The unique identifier for the bin.
   */
  id: string;

  /**
   * The parent bin id.
   */
  parent?: string;

  /**
   * The children of the bin.
   */
  children: string[];

  /**
   * The label for the bin which is displayed.
   */
  label: string;

  /**
   * The start of the bin, in absolute range coordinates.
   */
  x0: number;

  /**
   * The end of the bin, in absolute range coordinates.
   */
  x1: number;

  /**
   * The level of the bin in the hierarchy.
   */
  y: number;

  /**
   * The items in the bin.
   */
  items: Row[];

  /**
   * A function that checks if an entry is contained in the bin.
   */
  contains: (entry: Row) => boolean;

  // @TODO move this to a key or so
  value: T;
};

export type FlameBin<T extends Record<string, unknown>> = NumericalBin<T> | CategoricalBin<T>;

export type NumericalParameterColumn = {
  key: string;
  domain: number[];
  type: 'numerical';
};

export type CategoricalParameterColumn = {
  key: string;
  domain: string[] | number[];
  type: 'categorical';
};

export type ParameterColumn = NumericalParameterColumn | CategoricalParameterColumn;

export function parameterBinCategorical<V extends Record<string, unknown>>(
  column: CategoricalParameterColumn,
  samples: Row[],
  range: number[],
  level: number,
  parentId?: string,
  calculcateBinValue?: (items: Row[]) => V,
) {
  const minmax = range[1]! - range[0]!;
  const total = column.domain.length;

  const result = {} as Record<string, CategoricalBin<V>>;

  for (let i = 0, sum = 0; i < column.domain.length; i++) {
    const key = column.domain[i]!;
    const width = (1 / total) * minmax;

    const contains = (entry: Row) => entry[column.key] === key;

    const items = samples.filter(contains);

    result[key] = {
      id: nanoid(),
      parent: parentId,
      children: [],
      label: String(key),
      // Accomodates for rounding error in floats!
      x0: i === 0 ? range[0]! : range[0]! + sum,
      x1: i === column.domain.length - 1 ? range[1]! : range[0]! + sum + width,
      contains,
      items,
      y: level,

      // @TODO move this to a key or so
      // value: max(items.map((entry) => entry.value as number)) ?? 0,
      value: calculcateBinValue ? calculcateBinValue(items) : ({} as V),
    };

    sum += width;
  }

  return result;
}

export function parameterBinNumerical<V extends Record<string, unknown>>(
  column: NumericalParameterColumn,
  samples: Row[],
  range: number[],
  level: number,
  parentId?: string,
  calculcateBinValue?: (items: Row[]) => V,
) {
  const steps = ticks(column.domain[0]!, column.domain[1]!, 5);
  const tickStep = steps[1]! - steps[0]!;

  if (steps[0]! > column.domain[0]!) {
    steps.unshift(steps[0]! - tickStep);
  }

  if (steps[steps.length - 1]! < column.domain[1]!) {
    steps.push(steps[steps.length - 1]! + tickStep);
  }

  const bins: {
    x0: number;
    x1: number;
    min: number;
    max: number;
  }[] = [];

  for (let i = 0, sum = 0; i < steps.length - 1; i++) {
    const width = (1 / (steps.length - 1)) * (range[1]! - range[0]!);

    bins.push({
      min: steps[i]!,
      max: steps[i + 1]!,
      // Accomodates for rounding error in floats!
      x0: i === 0 ? range[0]! : range[0]! + sum,
      x1: i === steps.length - 1 ? range[1]! : range[0]! + sum + width,
    });

    sum += width;
  }

  const result: Record<string, NumericalBin<V>> = bins.reduce(
    (acc, bin) => {
      const key = `${bin.min}-${bin.max}`;

      const contains = (entry: Row) => {
        const value = entry[column.key] as number;
        return value >= bin.min && value < bin.max;
      };

      const items = samples.filter(contains);

      acc[key] = {
        id: nanoid(),
        parent: parentId,
        children: [],
        label: `${bin.min} - ${bin.max}`,
        x0: bin.x0,
        x1: bin.x1,
        items,
        contains,
        // @TODO move this to a key or so
        // value: max(items.map((entry) => entry.value as number)) ?? 0,
        value: calculcateBinValue ? calculcateBinValue(items) : ({} as V),
        y: level,
      };

      return acc;
    },
    {} as Record<string, NumericalBin<V>>,
  );

  return result;
}

function findLeafBinForSample<V extends Record<string, unknown>, B extends FlameBin<V>>(sample: Row, bins: B[], allBins: Record<string, B>) {
  for (const bin of bins) {
    if (bin.contains(sample)) {
      if (bin.children.length === 0) {
        return bin.id;
      }

      return findLeafBinForSample(
        sample,
        bin.children.map((childId) => allBins[childId]!),
        allBins,
      );
    }
  }

  return undefined;
}

/**
 * Assigns samples to leaf bins. Returns a record of id to sample array.
 */
export function assignSamplesToBins<V extends Record<string, unknown>, B extends FlameBin<V>>(samples: Row[], rootBins: B[], allBins: Record<string, B>) {
  const result = {} as Record<string, Row[]>;

  samples.forEach((sample) => {
    const binId = findLeafBinForSample(sample, rootBins, allBins);

    if (!binId) {
      throw new Error('Could not find bin for sample');
    }

    if (!result[binId]) {
      result[binId] = [];
    }

    result[binId].push(sample);
  });

  return result;
}

export function parameterGroupStep<V extends Record<string, unknown>>(
  data: ParameterColumn[],
  samples: Row[],
  range: number[],
  levels: string[],
  currentLevel: number,
  resultList: Record<string, FlameBin<V>>,
  parent?: FlameBin<V>,
  calculcateBinValue?: (items: Row[]) => V,
) {
  if (currentLevel >= levels.length) {
    return;
  }

  const column = data.find((entry) => entry.key === levels[currentLevel]!)!;

  let bins: Record<string, FlameBin<V>>;

  if (column.type === 'categorical') {
    bins = parameterBinCategorical(column, samples, range, currentLevel, parent?.id, calculcateBinValue);
  } else if (column.type === 'numerical') {
    bins = parameterBinNumerical(column, samples, range, currentLevel, parent?.id, calculcateBinValue);
  } else {
    throw new Error('Unsupported data type');
  }

  if (parent) {
    parent.children.push(...Object.values(bins).map((bin) => bin.id));
  }

  Object.values(bins).forEach((bin) => {
    resultList[bin.id] = bin;
  });

  Object.entries(bins).forEach(([key, bin]) => {
    parameterGroupStep(data, bin.items, [bin.x0, bin.x1], levels, currentLevel + 1, resultList, bin, calculcateBinValue);
  });
}

export function createParameterHierarchy<V extends Record<string, unknown>>(
  data: ParameterColumn[],
  samples: Row[],
  levels: string[],
  range: number[],
  calculcateBinValue: (items: Row[]) => V,
) {
  const resultList: Record<string, FlameBin<V>> = {};

  parameterGroupStep(data, samples, range, levels, 0, resultList, undefined, calculcateBinValue);

  return resultList;
}

export function estimateTransformForDomain({
  originScale,
  domain,
  containerWidth,
  zoomExtent,
}: {
  originScale: any;
  domain: [number, number];
  containerWidth: number;
  zoomExtent?: [number, number];
}): ReturnType<typeof m4.identityMatrix4x4> {
  const sxi = 0;
  const txi = 12;

  const scaleFactor = 1 / ((domain[1] - domain[0]) / (originScale.domain()[1] - originScale.domain()[0]));

  // Base formula is "tx + sx * x = newX"
  // Solve for tx = newX - sx * x
  // We know position 0 so it becomes tx + scaleFactor * domain[0] = 0
  const tx = -1 * scaleFactor * domain[0];

  const startPoint = originScale(domain[0]);
  const endPoint = originScale(domain[1]);

  const newTransform = m4.identityMatrix4x4();

  newTransform[sxi] = scaleFactor;

  if (zoomExtent) {
    newTransform[sxi] = Math.min(newTransform[sxi], zoomExtent[1]);
    newTransform[sxi] = Math.max(newTransform[sxi], zoomExtent[0]);
  }

  const zoomCenter = (startPoint + endPoint) / 2;

  newTransform[txi] = -1 * zoomCenter * newTransform[sxi] + containerWidth / 2;

  if (zoomExtent) {
    newTransform[txi] = Math.min(newTransform[txi], 0);
    newTransform[txi] = Math.max(newTransform[txi], -1 * containerWidth * zoomExtent[1] + containerWidth);
  }

  return newTransform;
}

export type AggregationType = 'min' | 'max' | 'mean' | 'median';

export function aggregateBy(aggregation: AggregationType, values: number[]) {
  switch (aggregation) {
    case 'min':
      return min(values) ?? 0;
    case 'max':
      return max(values) ?? 0;
    case 'mean':
      return mean(values) ?? 0;
    case 'median': {
      const sorted = sortBy(values);
      return sorted[Math.floor(sorted.length / 2)] ?? 0;
    }
    default:
      throw new Error('Unknown aggregation');
  }
}

export function adjustDomain(domain: number[]) {
  const newLower = Math.floor(domain[0]! * 100) / 100;
  const newUpper = Math.ceil(domain[1]! * 100) / 100;
  return [newLower, newUpper];
}
