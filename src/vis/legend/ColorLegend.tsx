import * as React from 'react';
import { range as rangeFunc } from 'lodash';
import { Group, Stack, Text, Box } from '@mantine/core';
import * as d3 from 'd3v7';
import { useEffect, useRef } from 'react';

export function ColorLegend({
  scale,
  width = 250,
  height = 20,
  range = [0, 1.1],
  tickCount = 5,
}: {
  scale: (t: number) => string;
  width?: number;
  height?: number;
  range?: [number, number];
  tickCount?: number;
}) {
  const colors = d3.range(tickCount).map((score) => {
    const num = (range[1] - range[0]) * (score / (tickCount - 1));
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

    const t = d3.range(height).map((i) => (i / height) * range[1]);

    for (let i = 0; i < t.length; ++i) {
      context.fillStyle = scale(t[i]);
      context.fillRect(0, i, width, 1);
    }
  }, [scale, width, height, range]);

  return (
    <Group spacing={5} noWrap>
      <canvas id="proteomicsLegendCanvas" ref={canvasRef} />
      <Stack align="stretch" justify="space-between" style={{ height: `${height}px` }} spacing={0} ml="0">
        {colors.map((color) => (
          <Text size="xs" key={color.color}>
            {color.score.toFixed(1)}
          </Text>
        ))}
      </Stack>
    </Group>
  );
}
