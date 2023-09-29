import * as React from 'react';
import { Group, Stack, Text } from '@mantine/core';
import * as d3 from 'd3v7';
import { useEffect, useMemo, useRef } from 'react';

export function ColorLegendVert({
  scale,
  width = 250,
  height = 20,
  range = [0, 1.1],
  tickCount = 5,
  title = null,
  format = '.3s',
}: {
  scale: (t: number) => string;
  width?: number;
  height?: number;
  range?: [number, number];
  tickCount?: number;
  title: string;
  format?: string;
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
    canvas.height = height;
    canvas.width = width;

    canvas.style.margin = '0';
    canvas.style.height = `${height}px`;
    canvas.style.imageRendering = 'pixelated';

    const t = d3
      .range(width)
      .map((i) => (i / width) * (range[1] - range[0]))
      .reverse();

    for (let i = t.length - 1; i >= 0; i--) {
      context.fillStyle = scale(t[i] + range[0]);
      context.fillRect(i, 0, 1, height);
    }
  }, [scale, width, height, range]);

  const formatFunc = useMemo(() => {
    return d3.format(format);
  }, [format]);

  return (
    <Stack gap={3} style={{ width: `100%` }}>
      {title ? (
        <Text color="dimmed" style={{ width: `100%`, whiteSpace: 'nowrap', textAlign: 'center' }}>
          {title}
        </Text>
      ) : null}
      <canvas style={{ width: '100%' }} id="proteomicsLegendCanvas" ref={canvasRef} />

      <Group justify="apart" style={{ width: `100%` }} gap={0} ml="0">
        {colors.map((color, i) => (
          // idk why this doesnt work when i use the score as the key, tbh. The scores definitely are unique, but something to do with the 0 changing on render, idk
          // eslint-disable-next-line react/no-array-index-key
          <Text size="xs" key={i}>
            {formatFunc(color.score)}
          </Text>
        ))}
      </Group>
    </Stack>
  );
}
