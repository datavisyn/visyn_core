import { nanoid } from '@reduxjs/toolkit';
import { extent, mean, ticks, max } from 'd3v7';
import groupBy from 'lodash/groupBy';
import isNumber from 'lodash/isNumber';
import map from 'lodash/map';

import { m4 } from '../../vis/vishooks/math';

export function isNumerical<T>(data: T[]) {
  return !data.some((datum) => !isNumber(datum) && datum !== null && datum !== undefined);
}

export function isCategorical<T>(data: T[]) {
  return !data.some((datum) => typeof datum !== 'string' && datum !== null && datum !== undefined);
}

export type Row = Record<string, unknown>;

export type NumericalBin = {
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
   * The accessor key for the bin.
   */
  key: string;

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

  // @TODO move this to a key or so
  value: number;
};

export type CategoricalBin = {
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
   * The accessor key for the bin.
   */
  key: string;

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

  // @TODO move this to a key or so
  value: number;
};

export type FlameBin = NumericalBin | CategoricalBin;

export function binNumerical<T extends Row>(data: T[], accessorKey: string, range: number[], level: number) {
  const numbers = map(data, accessorKey) as number[];
  const minmax = extent(numbers);

  // @TODO make the number of ticks dynamic?
  const steps = ticks(minmax[0]!, minmax[1]!, 5);
  const tickStep = steps[1]! - steps[0]!;

  if (steps[0]! > minmax[0]!) {
    steps.unshift(steps[0]! - tickStep);
  }

  if (steps[steps.length - 1]! < minmax[1]!) {
    steps.push(steps[steps.length - 1]! + tickStep);
  }

  const bins: {
    x0: number;
    x1: number;
    min: number;
    max: number;
    items: T[];
  }[] = [];

  for (let i = 0, sum = 0; i < steps.length - 1; i++) {
    bins.push({
      min: steps[i]!,
      max: steps[i + 1]!,
      // Accomodates for rounding error in floats!
      x0: i === 0 ? range[0]! : range[0]! + sum,
      x1: i === entries.length - 1 ? range[1]! : range[0]! + sum + width,
      items: [],
    });
  }

  // Bin the data
  data.forEach((datum, index) => {
    const number = numbers[index]!;
    const binIndex = Math.floor((number - steps[0]!) / tickStep);

    bins[binIndex]!.items.push(datum);
  });

  return bins;
}

export function binCategorical<T extends Row>(data: T[], accessorKey: string, range: number[], level: number) {
  const groups = groupBy(data, accessorKey);
  const total = data.length;
  const entries = Object.entries(groups);
  const minmax = range[1]! - range[0]!;

  const result = {} as Record<string, CategoricalBin>;

  for (let i = 0, sum = 0; i < entries.length; i++) {
    const [key, value] = entries[i]!;

    const width = (value.length / total) * minmax;

    result[key] = {
      id: nanoid(),
      key,
      label: key,
      // Accomodates for rounding error in floats!
      x0: i === 0 ? range[0]! : range[0]! + sum,
      x1: i === entries.length - 1 ? range[1]! : range[0]! + sum + width,

      items: value,
      y: level,
    };

    sum += width;
  }

  return result;
}

export function groupStep<T extends Row>(
  data: T[],
  range: number[],
  levels: string[],
  currentLevel: number,
  resultList: CategoricalBin[],
  parent?: CategoricalBin,
) {
  if (currentLevel >= levels.length) {
    return;
  }

  const values = map(data, levels[currentLevel]!);
  let bins: Record<string, FlameBin>;

  if (isNumerical(values)) {
    bins = binNumerical(data, levels[currentLevel]!, range, currentLevel);
  } else if (isCategorical(values)) {
    bins = binCategorical(data, levels[currentLevel]!, range, currentLevel);
  } else {
    throw new Error('Unsupported data type');
  }

  resultList.push(...Object.values(bins));

  Object.entries(bins).forEach(([key, bin]) => {
    groupStep(bin.items, [bin.x0, bin.x1], levels, currentLevel + 1, resultList);
  });
}

export type NumericalParameterColumn = {
  key: string;
  domain: number[];
  type: 'numerical';
};

export type CategoricalParameterColumn = {
  key: string;
  domain: string[];
  type: 'categorical';
};

export function parameterBinCategorical(column: CategoricalParameterColumn, samples: Row[], range: number[], level: number, parentId?: string) {
  const minmax = range[1]! - range[0]!;
  const total = column.domain.length;

  const result = {} as Record<string, CategoricalBin>;

  for (let i = 0, sum = 0; i < column.domain.length; i++) {
    const key = column.domain[i]!;
    const width = (1 / total) * minmax;

    const items = samples.filter((sample) => sample[column.key] === key);

    result[key] = {
      id: nanoid(),
      parent: parentId,
      children: [],
      key,
      label: key,
      // Accomodates for rounding error in floats!
      x0: i === 0 ? range[0]! : range[0]! + sum,
      x1: i === column.domain.length - 1 ? range[1]! : range[0]! + sum + width,

      items,
      y: level,

      // @TODO move this to a key or so
      value: max(items.map((entry) => entry.value as number)) ?? 0,
    };

    sum += width;
  }

  return result;
}

export function parameterBinNumerical(column: NumericalParameterColumn, samples: Row[], range: number[], level: number, parentId?: string) {
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

  const result: Record<string, NumericalBin> = bins.reduce(
    (acc, bin, index) => {
      const key = `${bin.min}-${bin.max}`;

      const items = samples.filter((sample) => {
        const value = sample[column.key] as number;
        return value >= bin.min && value < bin.max;
      });

      acc[key] = {
        id: nanoid(),
        parent: parentId,
        children: [],
        key,
        label: `${bin.min} - ${bin.max}`,
        x0: bin.x0,
        x1: bin.x1,
        items,
        // @TODO move this to a key or so
        value: max(items.map((entry) => entry.value as number)) ?? 0,
        y: level,
      };

      return acc;
    },
    {} as Record<string, NumericalBin>,
  );

  return result;
}

export function assignSamplesToBins<T extends Row>(bins: Record<string, FlameBin>) {}

export function parameterGroupStep(
  data: (NumericalParameterColumn | CategoricalParameterColumn)[],
  samples: Row[],
  range: number[],
  levels: string[],
  currentLevel: number,
  resultList: Record<string, FlameBin>,
  parent?: FlameBin,
) {
  if (currentLevel >= levels.length) {
    return;
  }

  const column = data.find((entry) => entry.key === levels[currentLevel]!)!;

  let bins: Record<string, FlameBin>;

  if (column.type === 'categorical') {
    bins = parameterBinCategorical(column, samples, range, currentLevel, parent?.id);
  } else if (column.type === 'numerical') {
    bins = parameterBinNumerical(column, samples, range, currentLevel, parent?.id);
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
    parameterGroupStep(data, bin.items, [bin.x0, bin.x1], levels, currentLevel + 1, resultList, bin);
  });
}

export function createParameterHierarchy(data: (NumericalParameterColumn | CategoricalParameterColumn)[], samples: Row[], levels: string[], range: number[]) {
  const resultList: Record<string, FlameBin> = {};

  parameterGroupStep(data, samples, range, levels, 0, resultList, undefined);

  return resultList;
}

export function createHierarchy<T extends Record<string, unknown>>(data: T[], levels: string[], range: number[]) {
  const resultList = [] as CategoricalBin[];

  groupStep(data, range, levels, 0, resultList);

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
