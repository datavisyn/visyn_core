import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useResizeObserver } from '@mantine/hooks';
import { op, table } from 'arquero';
import { select } from 'lineupjs';
import { ColumnInfo, ECloudType, EColumnTypes, ERainType, IRaincloudConfig, VisCategoricalValue, VisNumericalValue } from '../interfaces';

import { SplitViolin } from './cloud/SplitViolin';
import { DotPlot } from './rain/DotPlot';
import { MeanAndInterval } from './lightning/MeanAndInterval';
import { useXScale } from './hooks/useXScale';
import { XAxis } from '../hexbin/XAxis';
import { Heatmap } from './cloud/Heatmap';
import { Histogram } from './cloud/Histogram';
import { BeeSwarm } from './rain/BeeSwarm';
import { IRaindropCircle } from './utils';
import { Circle } from './rain/Circle';
import { WheatPlot } from './rain/WheatPlot';
import { Brush } from './Brush';

const margin = {
  top: 0,
  left: 20,
  right: 20,
  bottom: 0,
};
export function Raincloud({
  column,
  config,
  selectionCallback,
  selected,
}: {
  column: {
    resolvedValues: (VisNumericalValue | VisCategoricalValue)[];
    type: EColumnTypes;
    info: ColumnInfo;
  };
  config: IRaincloudConfig;
  selectionCallback: (ids: string[]) => void;
  selected: { [key: string]: boolean };
}) {
  const [ref, { width, height }] = useResizeObserver();

  const baseTable = useMemo(() => {
    return table({ values: column.resolvedValues.map((d) => d.val), ids: column.resolvedValues.map((d) => d.id) });
  }, [column.resolvedValues]);

  const [circles, setCircles] = useState<IRaindropCircle[]>([]);

  const xScale = useXScale({ range: [margin.left, width - margin.right], column });

  const circlesCallback = useCallback((callbackCircles: IRaindropCircle[]) => {
    setCircles(callbackCircles);
  }, []);

  const circlesRendered = useMemo(() => {
    return circles.map((circle) => {
      return (
        <Circle
          key={circle.id}
          x={circle.x}
          y={circle.y}
          id={circle.id}
          raincloudType={config.rainType}
          color={selected[circle.id] ? '#E29609' : 'cornflowerblue'}
        />
      );
    });
    // Hacking a bit here so the circles dont render twice, which would disable the animation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [circles, selected]);

  const brushCallback = useCallback(
    (range: [number, number]) => {
      const newRange = [xScale.invert(range[0]), xScale.invert(range[1])];
      const selectedIds = baseTable
        .params({ lowRange: newRange[0], highRange: newRange[1] })
        .filter((d, params) => d.values >= params.lowRange && d.values <= params.highRange)
        .array('ids');

      selectionCallback(selectedIds);
    },
    [baseTable, selectionCallback, xScale],
  );

  const aggregatedTable = useMemo(() => {
    return baseTable
      .orderby('values')
      .derive({ percentRank: op.ntile(100) })
      .groupby('percentRank')
      .rollup({ values: op.mean('values'), ids: op.array_agg('ids') });
  }, [baseTable]);

  return (
    <svg key={column.info.id} ref={ref} style={{ width: '100%', height: '100%' }}>
      <text textAnchor="middle" dominantBaseline="middle" x={width / 2} y={15}>
        {column.info.name}
      </text>
      <g>
        {config.cloudType === ECloudType.HEATMAP ? (
          <Heatmap width={width} height={height / 2} config={config} numCol={column} />
        ) : config.cloudType === ECloudType.HISTOGRAM ? (
          <Histogram width={width} height={height / 2} config={config} numCol={column} />
        ) : (
          <SplitViolin width={width} height={height / 2} config={config} numCol={column} />
        )}

        {config.rainType === ERainType.DOTPLOT ? (
          <DotPlot
            yPos={height / 2}
            width={width}
            height={height}
            config={config}
            numCol={column}
            circleCallback={circlesCallback}
            baseTable={config.aggregateRain ? aggregatedTable : baseTable}
          />
        ) : config.rainType === ERainType.BEESWARM ? (
          <BeeSwarm yPos={height / 2} width={width} height={height / 2} config={config} numCol={column} circleCallback={circlesCallback} />
        ) : config.rainType === ERainType.WHEATPLOT ? (
          <WheatPlot
            yPos={height / 2}
            width={width}
            height={height / 2}
            config={config}
            numCol={column}
            circleCallback={circlesCallback}
            baseTable={config.aggregateRain ? aggregatedTable : baseTable}
          />
        ) : null}
        {circlesRendered}

        <MeanAndInterval yPos={height / 2} width={width} height={height} config={config} numCol={column} />
        <XAxis xScale={xScale} vertPosition={height / 2} yRange={[height / 2, height / 2]} />
        <Brush y={height / 2 - 20} x={margin.left} height={40} width={width - margin.left} onBrush={brushCallback} id={column.info.id} />
      </g>
    </svg>
  );
}
