import React from 'react';

import { Slider, Stack, Text } from '@mantine/core';
import { DateTimePicker, DateValue } from '@mantine/dates';
import { Meta, StoryObj } from '@storybook/react';

import { fromNow, getMostRelevantTimeUnitFromNow } from './fromNow';

function PickerExample() {
  const [value, setValue] = React.useState<DateValue>(new Date('June 1, 2024, 12:00:00'));

  return (
    <Stack gap="xs">
      <Text fz="xl" fw={500}>
        Interactive DateTimePicker example
      </Text>
      <DateTimePicker value={value} onChange={setValue} label="Reference date" maw={200} />
      <Text>
        Generated label from reference date to the current date:{' '}
        <Text display="inline-block" fw={700} c="red">
          {fromNow(value)}
        </Text>
      </Text>
    </Stack>
  );
}

function SliderExample() {
  const [value, setValue] = React.useState(0);

  const transform = (v: number) => {
    return v >= 0 ? 2 ** v : -(2 ** -v);
  };

  const d = new Date(new Date().getTime() + transform(value));

  return (
    <Stack gap="xs">
      <Text fz="xl" fw={500}>
        Interactive Slider example
      </Text>
      <Slider
        scale={transform}
        step={1}
        value={value}
        onChange={setValue}
        min={-30}
        max={30}
        maw={400}
        label={() => `${Math.round(getMostRelevantTimeUnitFromNow(d)!.amount)} ${getMostRelevantTimeUnitFromNow(d)!.name}`}
      />
      <Text>
        Generated label from current date -/+ the slider value:{' '}
        <Text display="inline-block" fw={700} color="red">
          {fromNow(d)}
        </Text>
      </Text>
    </Stack>
  );
}

function TimeUtil() {
  return (
    <Stack p="xl" gap="xl">
      <Stack gap={0}>
        <Text fz="xl" fw={500}>
          Some basic examples (see code)
        </Text>
        <Text>{fromNow(new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 3))}</Text>
        <Text>{fromNow(new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7 * 3))}</Text>
        <Text>{fromNow(new Date(new Date().getTime() - 1000 * 60 * 60 * 2))}</Text>
        <Text>{fromNow(new Date(new Date().getTime() + 1000 * 60 * 2))}</Text>
        <Text>{fromNow(new Date(new Date().getTime() - 1000 * 5))}</Text>
      </Stack>

      <SliderExample />
      <PickerExample />
    </Stack>
  );
}

const meta: Meta<typeof TimeUtil> = {
  title: 'Components/Utils',
  component: TimeUtil,
};

export default meta;
type Story = StoryObj<typeof TimeUtil>;

export const TimeFromNow: Story = {
  args: {
    components: {
      aboutAppModal: {
        content: <Text>You can add some custom content to this about app modal. It should provide some meaningful description about the application.</Text>,
      },
    },
  },
};
