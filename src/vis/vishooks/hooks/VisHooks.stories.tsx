import React from 'react';

import { Button, Center, Group, Paper, Stack, Text } from '@mantine/core';
import { Meta, StoryObj } from '@storybook/react';

import { useLasso } from './useLasso';
import { SVGBrush } from '../components';
import { useAnimatedTransform } from './useAnimatedTransform';
import { useBrush } from './useBrush';
import { useCanvas } from './useCanvas';
import { useChart } from '../../../echarts/useChart';
import { SVGLasso } from '../components/SVGLasso';
import { ZoomTransform } from '../interfaces';
import { m4 } from '../math';

function UseLassoComponent() {
  const { setRef, value } = useLasso();

  return (
    <Center w={600} h={400}>
      <Stack>
        <Paper w={300} h={300} shadow="xl" withBorder>
          <svg ref={setRef} width="100%" height="100%">
            {value ? <SVGLasso value={value} strokeWidth={1} /> : null}
          </svg>
        </Paper>
      </Stack>
    </Center>
  );
}

function UseBrushComponent() {
  const { ref, setRef, value, setValue } = useBrush();

  return (
    <Center w={600} h={400}>
      <Stack>
        <Paper w={300} h={300} shadow="xl" withBorder>
          <svg ref={setRef} width="100%" height="100%">
            {value ? <SVGBrush parent={ref} value={value} onChange={setValue} /> : null}
          </svg>
        </Paper>
      </Stack>
    </Center>
  );
}

function UseCanvasComponent() {
  const { setRef, context, width, height, ratio } = useCanvas();

  React.useEffect(() => {
    if (context) {
      // Scale all drawing operations up by ratio
      context.beginPath();
      context.arc(width / 2, height / 2, 50 * ratio, 0, 2 * Math.PI);
      context.stroke();
    }
  }, [context, width, height, ratio]);

  return (
    <Center w={600} h={400}>
      <Stack>
        <Paper w={300} h={300} shadow="xl" withBorder>
          <canvas ref={setRef} width={width} height={height} style={{ width: '100%', height: '100%' }} />
        </Paper>
      </Stack>
    </Center>
  );
}

function UseAnimatedTransformComponent() {
  const [toggled, setToggled] = React.useState(false);

  const [animatedTransform, setAnimatedTransform] = React.useState<ZoomTransform>(m4.identityMatrix4x4());

  const { animate } = useAnimatedTransform({
    onIntermediate: (newT) => {
      setAnimatedTransform(newT);
    },
  });

  return (
    <Center w={800} h={600}>
      <Group>
        <Button
          onClick={() => {
            if (toggled) {
              const id = m4.identityMatrix4x4();
              m4.setTranslation(id, 100, 100, 0);

              animate(m4.identityMatrix4x4(), id);
            } else {
              const id = m4.identityMatrix4x4();
              m4.setTranslation(id, 100, 100, 0);

              animate(id, m4.identityMatrix4x4());
            }

            setToggled(!toggled);
          }}
        >
          Toggle Transform
        </Button>
        <Stack>
          <Stack>
            <Text fw="bold">Animated transform:</Text>
            <Text>t12: {animatedTransform[12]?.toPrecision(3)}</Text>
            <Text>t13: {animatedTransform[13]?.toPrecision(3)}</Text>
          </Stack>
        </Stack>
        <svg width={300} height={300}>
          <circle cx={50 + animatedTransform[12]!} cy={50 + animatedTransform[13]!} r={32} fill="red" />
        </svg>
      </Group>
    </Center>
  );
}

function UseChartComponent() {
  const { setRef, instance } = useChart({
    options: {
      xAxis: {},
      yAxis: {},
      visualMap: [
        {
          type: 'continuous',
          min: 0,
          max: 10,
          inRange: {
            color: ['red', 'yellow', 'green'],
          },
          dimension: 1,
        },
      ],
      series: [
        {
          data: [
            [10.0, 8.04],
            [8.07, 6.95],
            [13.0, 7.58],
            [9.05, 8.81],
            [11.0, 8.33],
            [14.0, 7.66],
            [13.4, 6.81],
            [10.0, 6.33],
            [14.0, 8.96],
            [12.5, 6.82],
            [9.15, 7.2],
            [11.5, 7.2],
            [3.03, 4.23],
            [12.2, 7.83],
            [2.02, 4.47],
            [1.05, 3.33],
            [4.05, 4.96],
            [6.03, 7.24],
            [12.0, 6.26],
            [12.0, 8.84],
            [7.08, 5.82],
            [5.02, 5.68],
          ],
          type: 'scatter',
        },
      ],
    },
  });

  return (
    <Center w={600} h={400}>
      <div ref={setRef} style={{ width: 600, height: 400 }} />
    </Center>
  );
}

function VisHooksComponent() {
  const [element, setElement] = React.useState<HTMLElement>();

  return (
    <Center w={600} h={400}>
      <Stack />
    </Center>
  );
}

const meta: Meta<typeof VisHooksComponent> = {
  component: VisHooksComponent,
};

export default meta;

type Story = StoryObj<typeof VisHooksComponent>;

export const UseLasso: Story = {
  render: () => {
    return <UseLassoComponent />;
  },
};

export const UseBrush: Story = {
  render: () => {
    return <UseBrushComponent />;
  },
};

export const UseCanvas: Story = {
  render: () => {
    return <UseCanvasComponent />;
  },
};

export const UseChart: Story = {
  render: () => {
    return <UseChartComponent />;
  },
};

export const UseAnimated: Story = {
  render: () => {
    return <UseAnimatedTransformComponent />;
  },
};
