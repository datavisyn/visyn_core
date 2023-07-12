import React, { useCallback, useMemo, useState } from 'react';
import { useResizeObserver } from '@mantine/hooks';
import { op, table } from 'arquero';
import { ColumnInfo, ECloudType, EColumnTypes, ELightningType, ERainType, IRaincloudConfig, VisCategoricalValue, VisNumericalValue } from '../interfaces';

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
import { StripPlot } from './rain/StripPlot';
import { Mean } from './lightning/Mean';
import { MedianAndInterval } from './lightning/MedianAndInterval';
import { Boxplot } from './lightning/Boxplot';

const margin = {
  top: 0,
  left: 20,
  right: 20,
  bottom: 0,
};

const MAX_NON_AGGREGATED_COUNT = 400;

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
          key={circle.id[0]}
          x={circle.x}
          isStrip={config.rainType === ERainType.STRIPPLOT}
          y={circle.y}
          id={circle.id[0]}
          raincloudType={config.rainType}
          // This causes some real slowdown above like 100k points. Smarter to do this in the arquero calculations?
          color={circle.id.find((s) => selected[s]) ? '#E29609' : 'cornflowerblue'}
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
      {width !== 0 && height !== 0 ? (
        <g>
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
                baseTable={config.aggregateRain || column.resolvedValues.length > MAX_NON_AGGREGATED_COUNT ? aggregatedTable : baseTable}
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
                baseTable={config.aggregateRain || column.resolvedValues.length > MAX_NON_AGGREGATED_COUNT ? aggregatedTable : baseTable}
              />
            ) : config.rainType === ERainType.STRIPPLOT ? (
              <StripPlot
                yPos={height / 2}
                width={width}
                height={height / 2}
                config={config}
                numCol={column}
                circleCallback={circlesCallback}
                baseTable={config.aggregateRain || column.resolvedValues.length > MAX_NON_AGGREGATED_COUNT ? aggregatedTable : baseTable}
              />
            ) : null}
            {circlesRendered}
            {config.lightningType === ELightningType.MEAN_AND_DEV ? (
              <MeanAndInterval yPos={height / 2} width={width} height={height} config={config} numCol={column} baseTable={baseTable} />
            ) : config.lightningType === ELightningType.MEAN ? (
              <Mean yPos={height / 2} width={width} height={height} config={config} numCol={column} baseTable={baseTable} />
            ) : config.lightningType === ELightningType.MEDIAN_AND_DEV ? (
              <MedianAndInterval yPos={height / 2} width={width} height={height} config={config} numCol={column} baseTable={baseTable} />
            ) : config.lightningType === ELightningType.BOXPLOT ? (
              <Boxplot yPos={height / 2} width={width} height={height} config={config} numCol={column} baseTable={baseTable} />
            ) : null}

            <XAxis xScale={xScale} vertPosition={height / 2} yRange={null} />
            <Brush y={height / 2 - 20} x={margin.left} height={40} width={width - margin.left} onBrush={brushCallback} id={column.info.id} />
          </g>
        </g>
      ) : null}
    </svg>
  );
}
