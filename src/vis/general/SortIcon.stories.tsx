import React from 'react';
import { ComponentStory } from '@storybook/react';
import { Stack, Text, Group } from '@mantine/core';
import { ESortStates, SortIcon, ISortIconProps } from './SortIcon';

function Wrapper({ props, initialState }: { props?: Omit<ISortIconProps, 'sortState' | 'setSortState'>; initialState?: ESortStates }) {
  const [sortState, setSortState] = React.useState<ESortStates>(initialState || ESortStates.NONE);

  return (
    <Stack gap="xs">
      <Group>
        <SortIcon {...props} sortState={sortState} setSortState={setSortState} />

        {[2, 1, 5, 3, 4]
          .sort((a, b) => {
            switch (sortState) {
              case ESortStates.ASC:
                return a - b;
              case ESortStates.DESC:
                return b - a;
              default:
                return 0;
            }
          })
          .map((i) => (
            <Text key={i}>{i}</Text>
          ))}
      </Group>
    </Stack>
  );
}

function Docs() {
  return (
    <Stack p="xl" gap="xl">
      <Stack gap="xs">
        <Text fz="xl" fw={500}>
          Basic example
        </Text>
        <Wrapper />
      </Stack>
      <Stack gap="xs">
        <Text fz="xl" fw={500}>
          Compact icon
        </Text>
        <Wrapper props={{ compact: true }} />
      </Stack>
      <Stack gap="xs">
        <Text fz="xl" fw={500}>
          With priority
        </Text>
        <Wrapper props={{ priority: 1 }} />
      </Stack>
      <Stack gap="xs">
        <Text fz="xl" fw={500}>
          Has no unsorted state
        </Text>
        <Wrapper props={{ hasUnsortedState: false }} initialState={ESortStates.ASC} />
      </Stack>
      <Stack gap="xs">
        <Stack gap={0}>
          <Text fz="xl" fw={500}>
            Sort descending on first click
          </Text>
          <Text c="dimmed">Only for specific use cases - the default is ascending</Text>
        </Stack>
        <Wrapper props={{ sortStateOnFirstClick: ESortStates.DESC }} />
      </Stack>
    </Stack>
  );
}

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Components/SortIcon',
  component: Docs,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
// eslint-disable-next-line react/function-component-definition
const Template: ComponentStory<typeof Docs> = (args) => {
  return <Docs />;
};

export const Default: typeof Template = Template.bind({});