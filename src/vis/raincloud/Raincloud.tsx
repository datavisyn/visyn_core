import React from 'react';
import { useResizeObserver } from '@mantine/hooks';
import { ColumnInfo, EColumnTypes, IRaincloudConfig, VisCategoricalValue, VisNumericalValue } from '../interfaces';

import { SplitViolin } from './cloud/SplitViolin';
import { DotPlot } from './rain/DotPlot';
import { MeanAndInterval } from './lightning/MeanAndInterval';
import { useXScale } from './hooks/useXScale';
import { XAxis } from '../hexbin/XAxis';
import { Heatmap } from './cloud/Heatmap';

const margin = {
  top: 0,
  left: 20,
  right: 20,
  bottom: 0,
};
export function Raincloud({
  column,
  config,
}: {
  column: {
    resolvedValues: (VisNumericalValue | VisCategoricalValue)[];
    type: EColumnTypes;
    info: ColumnInfo;
  };
  config: IRaincloudConfig;
}) {
  const [ref, { width, height }] = useResizeObserver();

  const xScale = useXScale({ range: [margin.left, width - margin.right], column });

  return (
    <svg key={column.info.id} ref={ref} style={{ width: '100%', height: '100%' }}>
      <text textAnchor="middle" dominantBaseline="middle" x={width / 2} y={15}>
        {column.info.name}
      </text>
      <g>
        {/* <SplitViolin width={width} height={height / 2} config={config} numCol={column} /> */}
        <Heatmap width={width} height={height / 2} config={config} numCol={column} />
        <DotPlot yPos={height / 2} width={width} height={height} config={config} numCol={column} />
        <MeanAndInterval yPos={height / 2} width={width} height={height} config={config} numCol={column} />
        <XAxis xScale={xScale} vertPosition={height / 2} yRange={[height / 2, height / 2]} />
      </g>
    </svg>
  );
}
