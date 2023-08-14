import { useEffect, useMemo } from 'react';

import { bin, op } from 'arquero';
import ColumnTable from 'arquero/dist/types/table/column-table';
import { ColumnInfo, EColumnTypes, VisCategoricalValue, VisNumericalValue } from '../../interfaces';
import { useXScale } from '../hooks/useXScale';
import { IRaincloudConfig } from '../utils';

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
      .rollup({ count: op.count(), ids: op.entries_agg('ids', 'values') });

    return temp.groupby('bins').rollup({ count: op.sum('count'), ids: op.array_agg('ids') });
  }, [baseTable]);

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
            { id: [val[0]].flat(), x: xScale(val[1]), y: yPos + margin.top + i * 10 }
          );
        });
    });

    console.log(circles.flat());

    circleCallback(circles.flat());
  }, [bins, circleCallback, xScale, yPos]);

  return null;
}
