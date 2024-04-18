import * as React from 'react';
import { Group, Stack, Text } from '@mantine/core';
import * as d3 from 'd3v7';
import { useEffect, useMemo, useRef } from 'react';

export function ColorLegend({
  scale,
  width = 250,
  height = 20,
  range = [0, 1.1],
  tickCount = 5,
  format = '.3s',
  rightMargin = 40,
  title = null,
}: {
  scale: (t: number) => string;
  width?: number;
  height?: number;
  range?: [number, number];
  tickCount?: number;
  format?: string;
  rightMargin?: number;
  title: string;
}) {
  const colors = d3
    .range(tickCount)
    .reverse()
    .map((score) => {
      const num = (range[1] - range[0]) * (score / (tickCount - 1)) + range[0];
      return { color: scale(num), score: num };
    });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas: HTMLCanvasElement = document.getElementById('proteomicsLegendCanvas') as HTMLCanvasElement;

    const context = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    canvas.style.margin = '0';
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.style.imageRendering = 'pixelated';

    const t = d3
      .range(height)
      .map((i) => (i / height) * (range[1] - range[0]))
      .reverse();

    for (let i = t.length - 1; i >= 0; i--) {
      context.fillStyle = scale(t[i] + range[0]);
      context.fillRect(0, i, width, 1);
    }
  }, [scale, width, height, range]);

  const formatFunc = useMemo(() => {
    return d3.format(format);
  }, [format]);

  return (
    <Group gap={5} wrap="nowrap" style={{ width: `${width + rightMargin}px` }}>
      <canvas id="proteomicsLegendCanvas" ref={canvasRef} />
      <Stack align="stretch" justify="space-between" style={{ height: `${height}px` }} gap={0} ml="0">
        {colors.map((color, i) => (
          // idk why this doesnt work when i use the score as the key, tbh. The scores definitely are unique, but something to do with the 0 changing on render, idk
          // eslint-disable-next-line react/no-array-index-key
          <Text size="xs" key={i}>
            {formatFunc(color.score)}
          </Text>
        ))}
      </Stack>
      {title ? (
        <Text c="dimmed" style={{ transform: 'rotate(90deg)', height: '100%', whiteSpace: 'nowrap', width: '20px' }}>
          {title}
        </Text>
      ) : null}
    </Group>
  );
}
