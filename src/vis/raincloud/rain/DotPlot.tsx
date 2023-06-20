import React, { useMemo } from 'react';

import { table, op, bin } from 'arquero';
import { ColumnInfo, EColumnTypes, IRaincloudConfig, VisCategoricalValue, VisNumericalValue } from '../../interfaces';
import { useXScale } from '../hooks/useXScale';

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
}) {
  const xScale = useXScale({ range: [margin.left, width - margin.right], column: numCol });

  const bins = useMemo(() => {
    return table({ values: numCol.resolvedValues.map((v) => v.val) })
      .groupby('values', { bins: bin('values', { maxbins: 20 }) })
      .count()
      .groupby('bins')
      .rollup({ count: op.sum('count'), average: op.mean('values') });
  }, [numCol.resolvedValues]);

  const circles = useMemo(() => {
    return (
      <g>
        {bins.objects().map((singleBin: { binVal: number; count: number; average: number }) => {
          return (
            <g key={singleBin.binVal}>
              {[...Array(singleBin.count).keys()].map((val) => {
                return (
                  // TODO:: What happens when we run out of space
                  <circle fill="cornflowerblue" key={`${singleBin.binVal}, ${val}`} r={4} cx={xScale(singleBin.average)} cy={yPos + margin.top + val * 10} />
                );
              })}
            </g>
          );
        })}
      </g>
    );
  }, [bins, xScale, yPos]);

  return circles;
}
