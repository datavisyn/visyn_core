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

export function WheatPlot({
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
      .rollup({ count: op.count(), ids: op.entries_agg('id', 'values') });

    return temp.groupby('bins').rollup({ count: op.sum('count'), ids: op.array_agg('ids') });
  }, [numCol]);

  useEffect(() => {
    const circles = bins.objects().map((singleBin: { binVal: number; count: number; ids: [string, number][] }) => {
      return singleBin.ids
        .flat()
        .sort((a, b) => {
          return a[1] - b[1];
        })
        .map((val, i) => {
          return (
            // TODO:: What happens when we run out of space
            { id: val[0], x: xScale(val[1]), y: yPos + margin.top + i * 10 }
          );
        });
    });

    circleCallback(circles.flat());
  }, [bins, circleCallback, xScale, yPos]);

  return null;
}
