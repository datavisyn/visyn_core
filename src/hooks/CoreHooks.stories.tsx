import React from 'react';
import { StoryObj, Meta } from '@storybook/react';
import { Button, Center, Stack } from '@mantine/core';
import { useSetRef } from './useSetRef';
import { useAsync } from './useAsync';

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

async function fetchRandomNumber() {
  // Sleep 1 second
  await new Promise((resolve) => {
    setTimeout(resolve, 1000);
  });

  return Math.random();
}

function UseAsyncTest() {
  const { value, status, error, execute } = useAsync(fetchRandomNumber, []);

  return (
    <Center w={600} h={400}>
      <Stack>
        {status === 'pending' ? <div>loading</div> : null}
        {status === 'success' ? <div>Value: {value}</div> : null}
        {status === 'error' ? <div>Error: {error?.message}</div> : null}

        <Button onClick={execute} disabled={status === 'pending'}>
          Fetch random number
        </Button>
      </Stack>
    </Center>
  );
}

const meta: Meta<typeof SetRefTest> = {
  component: SetRefTest,
};

export default meta;

type Story = StoryObj<typeof SetRefTest>;

export const UseSetRef: Story = {
  render: () => {
    return <SetRefTest />;
  },
};

export const UseAsync: Story = {
  render: () => {
    return <UseAsyncTest />;
  },
};
