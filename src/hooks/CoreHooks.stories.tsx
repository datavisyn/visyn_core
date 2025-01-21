import React from 'react';

import { Button, Center, Stack } from '@mantine/core';
import { Meta, StoryObj } from '@storybook/react';

import { useSetRef } from './useSetRef';

function SetRefTest() {
  const [element, setElement] = React.useState<Element>();
  const { setRef } = useSetRef({
    register: (el) => {
      setElement(el);
    },
    cleanup: (el) => {
      setElement(undefined);
    },
  });
  const [visible, setVisible] = React.useState(false);

  const toggle = () => {
    setVisible((v) => !v);
  };

  return (
    <Center w={600} h={400}>
      <Stack>
        <Button onClick={toggle}>Toggle visibility</Button>

        {visible ? <div ref={setRef}>Current element is {element?.nodeName}</div> : <div>No element</div>}
      </Stack>
    </Center>
  );
}

const meta: Meta<typeof SetRefTest> = {
  component: SetRefTest,
};

export default meta;

type Story = StoryObj<typeof SetRefTest>;

export const UseSetRef: Story = {};
