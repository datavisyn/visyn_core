import React, { useEffect, useMemo } from 'react';

import { table, op, bin } from 'arquero';
import * as d3 from 'd3v7';
import forceBoundary from 'd3-force-boundary';
import { ColumnInfo, EColumnTypes, IRaincloudConfig, VisCategoricalValue, VisNumericalValue } from '../../interfaces';
import { useXScale } from '../hooks/useXScale';
import { Circle } from './Circle';

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
  circleCallback: (circles: { id: string[]; x: number; y: number }[]) => void;
}) {
  const xScale = useXScale({ range: [margin.left, width - margin.right], column: numCol });

  const forceDirectedNode = useMemo(() => {
    if (xScale) {
      const force = d3
        .forceSimulation(numCol.resolvedValues.map((d) => ({ id: d.id, x: xScale(d.val as number), y: margin.top })))
        .force('boundary', forceBoundary(margin.left, margin.top, width, height - margin.bottom))

        .force('y', d3.forceY().strength(0.1).y(Math.max(margin.top, margin.top)))
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
  }, [height, numCol.resolvedValues, width, xScale]);

  useEffect(() => {
    const circles = forceDirectedNode.map((circle) => {
      return { id: [circle.id].flat(), x: circle.x, y: circle.y + yPos };
    });

    circleCallback(circles);
  }, [circleCallback, forceDirectedNode, yPos]);

  return null;
}
