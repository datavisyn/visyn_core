import React, { useMemo } from 'react';

import { table, op, bin } from 'arquero';
import * as d3 from 'd3v7';
import { ColumnInfo, EColumnTypes, IRaincloudConfig, VisCategoricalValue, VisNumericalValue } from '../../interfaces';
import { useXScale } from '../hooks/useXScale';

const margin = {
  top: 30,
  bottom: 20,
  left: 20,
  right: 20,
};

export function BeeSwarm({
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

  const forceDirectedNode = useMemo(() => {
    if (xScale) {
      const force = d3
        .forceSimulation(numCol.resolvedValues.map((col) => col.val as number).map((d) => ({ x: xScale(d), y: (height - margin.bottom + margin.top) / 2 })))
        .force(
          'y',
          d3
            .forceY()
            .strength(0.1)
            .y((height - margin.bottom - margin.top) / 2),
        )
        .force(
          'x',
          d3
            .forceX()
            .strength(1)
            .x((d) => d.x),
        )
        .force('collide', d3.forceCollide().radius(4.6));

      force.restart();

      const newSim = force.tick(200);

      return newSim.nodes();
    }
    return null;
  }, [height, numCol.resolvedValues, xScale]);

  console.log(forceDirectedNode);

  const circles = useMemo(() => {
    return (
      <g transform={`translate(0, ${yPos})`}>
        {forceDirectedNode.map((circle) => {
          return <circle fill="cornflowerblue" key={circle.index} r={4} cx={circle.x} cy={circle.y} />;
        })}
      </g>
    );
  }, [forceDirectedNode, yPos]);

  console.log(circles);

  return circles;
}
