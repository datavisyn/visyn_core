import React from 'react';
import { StoryObj, Meta } from '@storybook/react';
import { Center, Stack, Paper } from '@mantine/core';
import { lassoToSvgPath, useLasso } from './useLasso';
import { SVGLasso } from '../components/SVGLasso';
import { useBrush } from './useBrush';
import { SVGBrush } from '../components';

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
