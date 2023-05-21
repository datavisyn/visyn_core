import React, { useEffect, useMemo, useRef, useState } from 'react';
import { all, desc, op, table } from 'arquero';
import * as d3 from 'd3v7';
import { Box, Container, SimpleGrid } from '@mantine/core';
import { useResizeObserver } from '@mantine/hooks';
import { EBarGroupingType, IBarConfig, IVisConfig, Scales, VisColumn } from '../interfaces';
import { useSyncedRef } from '../../hooks/useSyncedRef';
import { useAsync } from '../../hooks/useAsync';
import { getBarData } from './utils';
import { YAxis } from './YAxis';
import { XAxis } from './XAxis';
import { GroupedBars } from './GroupedBars';
import { useGetGroupedBarScales } from './hooks/useGetGroupedBarScales';
import { SimpleBars } from './SimpleBars';
import { StackedBars } from './StackedBars';

const margin = {
  top: 25,
  bottom: 50,
  left: 25,
  right: 100,
};

export function SingleBarChart({ config, columns }: { config: IBarConfig; columns: VisColumn[] }) {
  const { value: allColumns, status: colsStatus } = useAsync(getBarData, [columns, config.catColumnSelected, config.group, config.multiples]);

  const [ref, { height, width }] = useResizeObserver();

  const { aggregatedTable, categoryScale, countScale, groupColorScale, groupScale, groupedTable } = useGetGroupedBarScales(
    allColumns,
    colsStatus,
    height,
    width,
    margin,
  );

  return (
    <Box ref={ref} style={{ width: '100%', height: '100%' }}>
      <Container
        fluid
        pl={0}
        pr={0}
        sx={{
          height,
          width: '100%',
          '.overlay': {
            cursor: 'default !important',
          },
        }}
      >
        <svg width={width} height={height}>
          <g>
            {countScale && categoryScale ? (
              <YAxis yScale={countScale} xRange={[categoryScale.range()[1], categoryScale.range()[0]]} horizontalPosition={margin.left} />
            ) : null}
            {categoryScale && countScale ? (
              <XAxis xScale={categoryScale} yRange={[countScale.range()[1], countScale.range()[0]]} vertPosition={height - margin.bottom} />
            ) : null}
            {config.group ? (
              config.groupType === EBarGroupingType.GROUP ? (
                <GroupedBars
                  groupedTable={groupedTable}
                  groupScale={groupScale}
                  categoryScale={categoryScale}
                  countScale={countScale}
                  groupColorScale={groupColorScale}
                  height={height}
                  margin={margin}
                />
              ) : (
                <StackedBars
                  groupedTable={groupedTable}
                  categoryScale={categoryScale}
                  countScale={countScale}
                  groupColorScale={groupColorScale}
                  height={height}
                  margin={margin}
                />
              )
            ) : (
              <SimpleBars aggregatedTable={aggregatedTable} categoryScale={categoryScale} countScale={countScale} height={height} margin={margin} />
            )}
          </g>
        </svg>
      </Container>
    </Box>
  );
}
