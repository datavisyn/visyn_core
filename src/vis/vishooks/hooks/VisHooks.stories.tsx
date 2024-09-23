import React from 'react';
import { StoryObj, Meta } from '@storybook/react';
import { Center, Stack, Paper } from '@mantine/core';
import { useLasso } from './useLasso';
import { SVGLasso } from '../components/SVGLasso';
import { useBrush } from './useBrush';
import { SVGBrush } from '../components';
import { useCanvas } from './useCanvas';

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
