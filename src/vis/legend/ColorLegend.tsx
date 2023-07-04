import * as React from 'react';
import { range } from 'lodash';
import { Group, Stack, Text, Box } from '@mantine/core';
import * as d3 from 'd3v7';
import { useEffect, useRef } from 'react';

export function ColorLegend({ scale, width = 250, height = 20 }: { scale: (t: number) => string; width?: number; height?: number }) {
  const colors = range(0, 1.1, 0.1).map((score) => {
    return { color: scale(score), score };
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

    const t = d3.range(width).map((i) => i / width);

    for (let i = 0; i < t.length; ++i) {
      context.fillStyle = scale(t[i]);
      context.fillRect(i, 0, 1, height);
    }

    // context.();
  }, [scale, width, height]);

  return (
    <Stack spacing={5}>
      <canvas id="proteomicsLegendCanvas" ref={canvasRef} />
      <Group position="apart" style={{ width: `${width}px` }} spacing={0} align="flex-start" ml="0">
        {colors.map((color, i) => (
          <Text size="xs" key={color.color}>
            {i % 2 === 0 ? color.score.toFixed(1) : ''}
          </Text>
        ))}
      </Group>
    </Stack>
  );
}
