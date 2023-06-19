import { Group, Stack, Text, Tooltip } from '@mantine/core';
import { useResizeObserver } from '@mantine/hooks';
import { table } from 'arquero';
import * as d3 from 'd3v7';
import * as React from 'react';

import { useAsync } from '../../hooks';
import { IHeatmapConfig, VisColumn } from '../interfaces';
import { HeatmapRect } from './HeatmapRect';
import { getHeatmapData } from './utils';

const interRectDistance = 1;
const margin = {
  top: 20,
  right: 20,
  bottom: 10,
  left: 20,
};

export function Heatmap({ config, columns }: { config: IHeatmapConfig; columns: VisColumn[] }) {
  const { value: allColumns } = useAsync(getHeatmapData, [columns, config?.catColumnsSelected]);
  const [ref, { width, height }] = useResizeObserver();
  const [tooltipText, setTooltipText] = React.useState<string | null>(null);

  const hasEnoughCatCols = allColumns?.catColumn && allColumns?.catColumn?.length > 1;

  const { xValues, yValues, groupedValues } = React.useMemo(() => {
    if (!hasEnoughCatCols) return { xValues: [], yValues: [], groupedValues: [] };
    const myTable = table({
      x: allColumns.catColumn[0]?.resolvedValues.map(({ val }) => val),
      y: allColumns.catColumn[1]?.resolvedValues.map(({ val }) => val),
    });
    const xVals = [...new Set(allColumns.catColumn[0]?.resolvedValues.map(({ val }) => val))];
    const yVals = [...new Set(allColumns.catColumn[1]?.resolvedValues.map(({ val }) => val))];
    return {
      xValues: xVals as string[],
      yValues: yVals as string[],
      groupedValues: myTable.groupby('x', 'y').count().objects() as { x: string; y: string; count: number }[],
    };
  }, [allColumns?.catColumn, hasEnoughCatCols]);

  const rectWidth = React.useMemo(
    () => (xValues.length && width ? (width - margin.left - margin.right - interRectDistance * xValues.length) / xValues.length : 0),
    [width, xValues.length],
  );
  const rectHeight = React.useMemo(
    () => (yValues.length && height ? (height - margin.bottom - margin.top - interRectDistance * yValues.length) / yValues.length : 0),
    [height, yValues.length],
  );

  const colorScale = React.useMemo(() => {
    if (!hasEnoughCatCols) return d3.scaleSequential(d3.interpolateReds);
    return d3.scaleSequential<string, string>(d3.interpolateBlues).domain(d3.extent(groupedValues, (d) => d.count as number));
  }, [hasEnoughCatCols, groupedValues]);

  return (
    <Stack sx={{ width: '100%', height: '100%' }} spacing={0} align="center" justify="center">
      {!hasEnoughCatCols ? (
        <Text align="center" color="dimmed">
          Select at least 2 categorical columns to display heatmap
        </Text>
      ) : (
        <>
          <Group noWrap sx={{ width: '100%', height: '100%' }} spacing={0}>
            <Text color="dimmed" sx={{ transform: 'rotate(-90deg)', whiteSpace: 'nowrap' }}>
              {allColumns.catColumn[1].info.name}
            </Text>
            <Tooltip.Floating label={tooltipText} disabled={!tooltipText} withinPortal>
              <svg width="100%" height="100%" ref={ref}>
                {xValues.map((x: string, iX: number) =>
                  yValues.map((y: string, iY: number) => {
                    const count = groupedValues?.find((d) => d.x === x && d.y === y)?.count ?? 0;
                    return (
                      <HeatmapRect
                        key={`${x}-${y}`}
                        x={(rectWidth + interRectDistance) * iX}
                        y={(rectHeight + interRectDistance) * iY}
                        width={rectWidth}
                        height={rectHeight}
                        color={colorScale(count)}
                        setTooltipText={() => setTooltipText(`${x} - ${y} (${count})`)}
                        unsetTooltipText={() => setTooltipText(null)}
                      />
                    );
                  }),
                )}
              </svg>
            </Tooltip.Floating>
          </Group>
          <Text color="dimmed" sx={{ whiteSpace: 'nowrap' }}>
            {allColumns.catColumn[0].info.name ?? ''}
          </Text>
        </>
      )}
    </Stack>
  );
}
