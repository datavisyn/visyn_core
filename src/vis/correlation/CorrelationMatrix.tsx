import { Box, Center, Loader, Stack, Text, Tooltip, rem } from '@mantine/core';
import { useResizeObserver } from '@mantine/hooks';
import * as d3 from 'd3v7';
import { uniqueId } from 'lodash';
import { scaleBand } from 'd3v7';
import { corrcoeff, spearmancoeff, tukeyhsd } from 'jstat';
import * as React from 'react';
import { useMemo } from 'react';
import { useAsync } from '../../hooks/useAsync';
import { ColumnInfo, EColumnTypes, EScaleType, ICommonVisProps, VisCategoricalValue, VisNumericalValue } from '../interfaces';
import { ColorLegendVert } from '../legend/ColorLegendVert';
import { CorrelationPair, CorrelationPairProps } from './components/CorrelationPair';
import { ECorrelationType, ICorrelationConfig } from './interfaces';
import { getCorrelationMatrixData } from './utils';
import { VIS_AXIS_LABEL_SIZE, VIS_LABEL_COLOR, VIS_GRID_COLOR } from '../general/constants';
import { DownloadPlotButton } from '../general/DownloadPlotButton';

const paddingCircle = { top: 5, right: 5, bottom: 5, left: 5 };
const CIRCLE_MIN_SIZE = 4;

const margin = { top: 20, right: 20, bottom: 20, left: 20 };

export function CorrelationMatrix({
  config,
  columns,
  uniquePlotId,
  showDownloadScreenshot,
}: Pick<ICommonVisProps<ICorrelationConfig>, 'config' | 'columns' | 'uniquePlotId' | 'showDownloadScreenshot'>) {
  const id = React.useMemo(() => uniquePlotId || uniqueId('CorrelationVis'), [uniquePlotId]);
  const { value: dataAll, status } = useAsync(getCorrelationMatrixData, [columns, config.numColumnsSelected]);
  const [data, setData] = React.useState<{ resolvedValues: (VisNumericalValue | VisCategoricalValue)[]; type: EColumnTypes; info: ColumnInfo }[]>(null);

  // Set data used for calculation and apply filter if given
  React.useEffect(() => {
    if (dataAll) {
      const cols = [];
      dataAll.numericalColumns.forEach((col) => {
        cols.push(col);
      });
      setData(cols);
    }
  }, [dataAll]);

  const [ref, { width, height }] = useResizeObserver();

  const availableSize = useMemo(() => {
    return Math.min(width - margin.left - margin.right, height - margin.top - margin.bottom);
  }, [height, width]);

  const colorScale = d3
    .scaleSequential<
      string,
      string
    >(d3.piecewise(d3.interpolateRgb.gamma(2.2), ['#003367', '#16518a', '#2e72ae', '#5093cd', '#77b5ea', '#aad7fd', '#F1F3F5', '#fac7a9', '#f99761', '#e06d3b', '#c2451a', '#99230d', '#6f0000'].reverse()))
    .domain([-1, 1]);

  // Scales
  const xScale = React.useMemo(() => {
    if (!data) {
      return null;
    }
    return scaleBand()
      .range([margin.left, availableSize + margin.left])
      .domain(data.map((column) => column.info.id));
  }, [data, availableSize]);

  const yScale = React.useMemo(() => {
    if (!data) {
      return null;
    }
    return scaleBand()
      .range([margin.top, availableSize + margin.top])
      .domain(data.map((column) => column.info.id));
  }, [data, availableSize]);

  const circleSizeScale = React.useMemo(() => {
    if (!data) {
      return null;
    }
    const maxSize = Math.min(xScale.bandwidth() / 2 - paddingCircle.left, yScale.bandwidth() / 2 - paddingCircle.top);
    return config.pScaleType === EScaleType.LINEAR
      ? d3.scaleLinear().domain(config.pDomain).range([CIRCLE_MIN_SIZE, maxSize]).clamp(true)
      : d3.scaleLog().domain(config.pDomain).range([CIRCLE_MIN_SIZE, maxSize]).clamp(true);
  }, [config.pDomain, config.pScaleType, data, xScale, yScale]);

  // Calculate correlation results
  const memoizedCorrelationResults = React.useMemo(() => {
    if (!data) {
      return null;
    }

    let coefffunc = (x: number[], y: number[]) => null;
    if (config.correlationType === ECorrelationType.PEARSON) {
      coefffunc = corrcoeff;
    } else if (config.correlationType === ECorrelationType.SPEARMAN) {
      coefffunc = spearmancoeff;
    }

    const cols = data;
    const correlationResults = [] as CorrelationPairProps[];

    for (let x = 1; x < cols.length; x++) {
      for (let y = 0; y < x; y++) {
        const correlation = coefffunc(
          cols[x].resolvedValues.map((resolved) => resolved.val as number),
          cols[y].resolvedValues.map((resolved) => resolved.val as number),
        );

        const pValue = tukeyhsd([
          cols[x].resolvedValues.map((resolved) => resolved.val as number),
          cols[y].resolvedValues.map((resolved) => resolved.val as number),
        ]);

        const xName = cols[x].info.id;
        const yName = cols[y].info.id;

        const value: CorrelationPairProps = {
          xi: x,
          yi: y,
          cxLT: xScale(yName) + xScale.bandwidth() / 2,
          cyLT: yScale(xName) + yScale.bandwidth() / 2,
          cxUT: xScale(xName) + xScale.bandwidth() / 2,
          cyUT: yScale(yName) + yScale.bandwidth() / 2,
          correlation,
          pValue: pValue[0][1],
          xName: cols[x].info.name,
          yName: cols[y].info.name,
          radius: circleSizeScale(pValue[0][1]),
        };
        correlationResults.push(value);
      }
    }

    return correlationResults;
  }, [circleSizeScale, config.correlationType, data, xScale, yScale]);

  // Show labels on diagonal of matrix
  const labelsDiagonal = React.useMemo(() => {
    if (!data) {
      return null;
    }
    return data.map((col) => {
      const currentX = xScale(col.info.id);
      const currentY = yScale(col.info.id);
      return (
        <g key={`label-${col.info.name}`}>
          <rect stroke={VIS_GRID_COLOR} strokeWidth={1} fill="none" x={currentX} y={currentY} width={xScale.bandwidth()} height={yScale.bandwidth()} />
          <foreignObject x={currentX} y={currentY} width={xScale.bandwidth()} height={yScale.bandwidth()}>
            <Center style={{ height: '100%' }} px={5}>
              <Tooltip
                label={
                  <Stack gap={0} align="center">
                    <Text>{col.info.name}</Text>
                    {col.info.description && <Text size="xs">{col.info.description}</Text>}
                  </Stack>
                }
                arrowSize={6}
                withinPortal
                withArrow
              >
                <Stack gap="xs" align="center" justify="center">
                  <Text
                    size={rem(VIS_AXIS_LABEL_SIZE)}
                    c={VIS_LABEL_COLOR}
                    fw="bold"
                    style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
                  >
                    {col.info.name}
                  </Text>
                  {col.info.description && (
                    <Text size={rem(VIS_AXIS_LABEL_SIZE)} c={VIS_LABEL_COLOR} style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {col.info.description}
                    </Text>
                  )}
                </Stack>
              </Tooltip>
            </Center>
          </foreignObject>
        </g>
      );
    });
  }, [data, xScale, yScale]);

  return (
    <Stack pr="40px" style={{ height: '100%', width: '100%' }}>
      {status === 'success' ? (
        <Stack align="center" gap={0} id={id} style={{ height: '100%', width: '100%' }}>
          {showDownloadScreenshot ? (
            <Center>
              <DownloadPlotButton uniquePlotId={id} config={config} />
            </Center>
          ) : null}
          <Box pl={margin.left} pr={margin.right}>
            <ColorLegendVert format=".3~g" scale={colorScale} width={availableSize} height={20} range={[-1, 1]} title="Correlation" />
          </Box>
          <Box ref={ref} style={{ height: '100%', width: `100%`, overflow: 'hidden' }}>
            <svg style={{ height, width, overflow: 'hidden' }}>
              <g transform={`translate(${(width - availableSize - margin.left - margin.right) / 2}, 0)`}>
                {memoizedCorrelationResults?.map((value) => {
                  return (
                    <CorrelationPair
                      key={`${value.xName}-${value.yName}`}
                      value={value}
                      fill={colorScale(value.correlation)}
                      boundingRect={{ width: xScale.bandwidth(), height: yScale.bandwidth() }}
                      config={config}
                    />
                  );
                })}
                {labelsDiagonal}
              </g>
            </svg>
          </Box>
        </Stack>
      ) : (
        <Center>
          <Loader />
        </Center>
      )}
    </Stack>
  );
}
