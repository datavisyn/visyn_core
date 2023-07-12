import React, { useEffect, useMemo } from 'react';

import { table, op, bin } from 'arquero';
import ColumnTable from 'arquero/dist/types/table/column-table';
import { ColumnInfo, EColumnTypes, IRaincloudConfig, VisCategoricalValue, VisNumericalValue } from '../../interfaces';
import { useXScale } from '../hooks/useXScale';
import { Circle } from './Circle';

const margin = {
  top: 30,
  bottom: 20,
  left: 20,
  right: 20,
};

export function DotPlot({
  numCol,
  config,
  width,
  height,
  yPos,
  baseTable,
  circleCallback,
}: {
  numCol: {
    resolvedValues: (VisNumericalValue | VisCategoricalValue)[];
    type: EColumnTypes;
    info: ColumnInfo;
  };
  config: IRaincloudConfig;
  width: number;
  height: number;
  yPos: number;
  baseTable: ColumnTable;
  circleCallback: (circles: { id: string[]; x: number; y: number }[]) => void;
}) {
  const xScale = useXScale({ range: [margin.left, width - margin.right], column: numCol });

  const bins = useMemo(() => {
    const temp = baseTable
      .orderby('values')
      .groupby('values', { bins: bin('values', { maxbins: 20 }) })
      .rollup({ ids: op.array_agg('ids'), count: op.count() });

    return temp.groupby('bins').rollup({ ids: op.array_agg('ids'), count: op.sum('count'), average: op.mean('values') });
  }, [baseTable]);

  useEffect(() => {
    const circles = bins.objects().map((singleBin: { ids: string[][]; binVal: number; count: number; average: number }) => {
      return singleBin.ids
        .flat()
        .sort()
        .map((val, i) => {
          return (
            // TODO:: What happens when we run out of space
            { id: [val].flat(), x: xScale(singleBin.average), y: yPos + margin.top + i * 10 }
          );
        });
    });

    circleCallback(circles.flat());
  }, [bins, circleCallback, xScale, yPos]);

  return null;
}
