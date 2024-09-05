import { Center, Stack, Text, Tooltip, useMantineTheme } from '@mantine/core';
import * as d3 from 'd3v7';
import * as React from 'react';
import { useMemo } from 'react';
import { ICorrelationConfig } from '../interfaces';
import { VIS_GRID_COLOR } from '../../general/constants';

const marginRect = { top: 0, right: 0, bottom: 0, left: 0 };

export interface CorrelationPairProps {
  xi: number;
  yi: number;
  cxLT: number;
  cyLT: number;
  cxUT: number;
  cyUT: number;
  correlation: number;
  pValue: number;
  xName: string;
  yName: string;
  radius: number;
}

export function CorrelationPair({
  value,
  fill,
  boundingRect,
  config,
}: {
  value: CorrelationPairProps;
  fill: string;
  boundingRect: { width: number; height: number };
  config: ICorrelationConfig;
}) {
  const [isHover, setIsHover] = React.useState(false);
  const theme = useMantineTheme();
  const hoverColor = theme.colors.gray[1];

  const format = useMemo(() => {
    return d3.format('.3g');
  }, []);

  const correlationFormat = useMemo(() => {
    return d3.format('.3g');
  }, []);

  const topRect = useMemo(() => {
    return (
      <g>
        <rect
          strokeWidth={1}
          stroke={VIS_GRID_COLOR}
          width={boundingRect.width - marginRect.left - marginRect.right}
          height={boundingRect.height - marginRect.top - marginRect.bottom}
          x={value.cxUT - boundingRect.width / 2 + marginRect.left}
          y={value.cyUT - boundingRect.height / 2 + marginRect.top}
          fill={isHover ? hoverColor : 'transparent'}
        />
        <circle data-testid="CorrelationPairCircle" cx={value.cxUT} cy={value.cyUT} r={value.radius} fill={fill} />
      </g>
    );
  }, [boundingRect.height, boundingRect.width, fill, hoverColor, isHover, value]);

  const bottomRect = useMemo(() => {
    return (
      <g>
        <rect
          strokeWidth={1}
          stroke={VIS_GRID_COLOR}
          width={boundingRect.width - marginRect.left - marginRect.right}
          height={boundingRect.height - marginRect.top - marginRect.bottom}
          x={value.cxLT - boundingRect.width / 2 + marginRect.left}
          y={value.cyLT - boundingRect.height / 2 + marginRect.top}
          fill={isHover ? hoverColor : 'transparent'}
        />
        <foreignObject
          style={{ overflow: 'hidden' }}
          x={value.cxLT - boundingRect.width / 2 + marginRect.left}
          y={value.cyLT - boundingRect.height / 2 + marginRect.top}
          width={boundingRect.width - marginRect.left - marginRect.right}
          height={boundingRect.height - marginRect.top - marginRect.bottom}
        >
          <Center style={{ height: '100%' }}>
            <Stack style={{ height: '100%', width: '100%', overflow: 'hidden' }} align="center" justify="center" gap={2} p={5}>
              <Text
                data-testid="CorrelationPairR"
                size="xs"
                style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%', textAlign: 'center' }}
              >
                {`r: ${correlationFormat(value.correlation)}`}
              </Text>
              <Text size="xs" style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%', textAlign: 'center' }}>
                {`p: ${format(value.pValue)}`}
              </Text>
            </Stack>
          </Center>
        </foreignObject>
      </g>
    );
  }, [boundingRect.height, boundingRect.width, correlationFormat, format, hoverColor, isHover, value.correlation, value.cxLT, value.cyLT, value.pValue]);

  const label = useMemo(() => {
    return (
      <Stack gap={2}>
        <Text>{`${value.xName} / ${value.yName}`}</Text>
        <Text>Correlation: {correlationFormat(value.correlation)}</Text>
        <Text>P-value: {format(value.pValue)}</Text>
      </Stack>
    );
  }, [correlationFormat, format, value]);

  return (
    <g onMouseOver={() => setIsHover(true)} onMouseLeave={() => setIsHover(false)}>
      <Tooltip keepMounted={false} hidden={!isHover} withinPortal onMouseLeave={() => setIsHover(false)} label={label}>
        {topRect}
      </Tooltip>

      <Tooltip keepMounted={false} hidden={!isHover} withinPortal onMouseLeave={() => setIsHover(false)} label={label}>
        {bottomRect}
      </Tooltip>
    </g>
  );
}
