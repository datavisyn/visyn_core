import React from 'react';

import { Center, Combobox } from '@mantine/core';
import { Meta, StoryObj } from '@storybook/react';

import { SingleSelect } from './single-select';

// todo: search

const meta: Meta<typeof Combobox> = {
  component: Combobox,
};

export default meta;
type Story = StoryObj<typeof Combobox>;

export const BasicSelect: Story = {
  render: () => (
    <Center w={300}>
      <SingleSelect />
    </Center>
  ),
};
