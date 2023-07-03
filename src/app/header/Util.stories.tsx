import React from 'react';
import { ComponentStory } from '@storybook/react';
import { Slider, Stack, Text } from '@mantine/core';
import { fromNow, getMostRelevantTimeUnitFromNow } from '../../utils/fromNow';

function TimeUtil() {
  const [value, setValue] = React.useState(0);

  const transform = (v: number) => {
    return v >= 0 ? 2 ** v : -(2 ** -v);
  };

  const d = new Date(new Date().getTime() + transform(value));

  return (
    <Stack p="lg">
      <Text>Some sanity checks...</Text>
      <Text>{fromNow(new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 3))}</Text>
      <Text>{fromNow(new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7 * 3))}</Text>
      <Text>{fromNow(new Date(new Date().getTime() - 1000 * 60 * 60 * 2))}</Text>
      <Text>{fromNow(new Date(new Date().getTime() + 1000 * 60 * 2))}</Text>
      <Text>{fromNow(new Date(new Date().getTime() - 1000 * 5))}</Text>
      <Slider
        py="xl"
        scale={transform}
        step={1}
        value={value}
        onChange={setValue}
        min={-30}
        max={30}
        labelAlwaysOn
        label={() => `${Math.round(getMostRelevantTimeUnitFromNow(d).amount)} ${getMostRelevantTimeUnitFromNow(d).name}`}
      />
      {fromNow(d)}
    </Stack>
  );
}

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/Ui/Utils',
  component: TimeUtil,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
// eslint-disable-next-line react/function-component-definition
const Template: ComponentStory<typeof TimeUtil> = (args) => {
  return <TimeUtil />;
};

export const Basic: typeof Template = Template.bind({});
Basic.args = {
  components: {
    aboutAppModal: {
      content: <Text>You can add some custom content to this about app modal. It should provide some meaningful description about the application.</Text>,
    },
  },
};
