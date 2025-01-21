import zipWith from 'lodash/zipWith';

import { createBinLookup } from './create-bin-lookup';
import type { getBarData } from './get-bar-data';
import { getLabelOrUnknown } from '../../../../general/utils';
import { EColumnTypes, type VisNumericalValue } from '../../../../interfaces';

export function generateDataTable(allColumns: Awaited<ReturnType<typeof getBarData>>) {
  // bin the `group` column values if a numerical column is selected
  const binLookup: Map<VisNumericalValue, string> | null =
    allColumns.groupColVals?.type === EColumnTypes.NUMERICAL ? createBinLookup(allColumns.groupColVals?.resolvedValues as VisNumericalValue[]) : null;

  return zipWith(
    allColumns.catColVals?.resolvedValues ?? [], // add array as fallback value to prevent zipWith from dropping the column
    allColumns.aggregateColVals?.resolvedValues ?? [], // add array as fallback value to prevent zipWith from dropping the column
    allColumns.groupColVals?.resolvedValues ?? [], // add array as fallback value to prevent zipWith from dropping the column
    allColumns.facetsColVals?.resolvedValues ?? [], // add array as fallback value to prevent zipWith from dropping the column
    (cat, agg, group, facet) => ({
      id: cat.id,
      category: getLabelOrUnknown(cat?.val),
      agg: agg?.val as number,

      // if the group column is numerical, use the bin lookup to get the bin name, otherwise use the label or 'unknown'
      group: typeof group?.val === 'number' ? (binLookup?.get(group as VisNumericalValue) as string) : getLabelOrUnknown(group?.val),

      facet: getLabelOrUnknown(facet?.val),
    }),
  );
}
