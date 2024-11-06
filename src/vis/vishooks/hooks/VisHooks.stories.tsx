import React from 'react';
import { StoryObj, Meta } from '@storybook/react';
import { Center, Stack, Paper, Button, Text, Group } from '@mantine/core';
import { lassoToSvgPath, useLasso } from './useLasso';
import { Center, Stack, Paper } from '@mantine/core';
import { useLasso } from './useLasso';
import { SVGLasso } from '../components/SVGLasso';
import { useBrush } from './useBrush';
import { SVGBrush } from '../components';
import { useCanvas } from './useCanvas';
import { m4 } from '../math';
import { ZoomTransform } from '../interfaces';
import { useAnimatedTransform } from './useAnimatedTransform';

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

export const UseAnimated: Story = {
  render: () => {
    return <UseAnimatedTransformComponent />;
  },
};
