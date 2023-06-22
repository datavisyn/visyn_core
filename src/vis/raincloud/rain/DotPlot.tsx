import React, { useEffect, useMemo } from 'react';

import { table, op, bin } from 'arquero';
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
  circleCallback: (circles: { id: string; x: number; y: number }[]) => void;
}) {
  const xScale = useXScale({ range: [margin.left, width - margin.right], column: numCol });

  const bins = useMemo(() => {
    const temp = table({ id: numCol.resolvedValues.map((v) => v.id), values: numCol.resolvedValues.map((v) => v.val) })
      .orderby('values')
      .groupby('values', { bins: bin('values', { maxbins: 20 }) })
      .rollup({ ids: op.array_agg('id'), count: op.count() });

    return temp.groupby('bins').rollup({ ids: op.array_agg('ids'), count: op.sum('count'), average: op.mean('values') });
  }, [numCol]);

  useEffect(() => {
    console.log('circles getting drawn');
    const circles = bins.objects().map((singleBin: { ids: string[][]; binVal: number; count: number; average: number }) => {
      return singleBin.ids
        .flat()
        .sort()
        .map((val, i) => {
          return (
            // TODO:: What happens when we run out of space
            { id: val, x: xScale(singleBin.average), y: yPos + margin.top + i * 10 }
          );
        });
    });

    circleCallback(circles.flat());
  }, [bins, circleCallback, xScale, yPos]);

  return null;
}