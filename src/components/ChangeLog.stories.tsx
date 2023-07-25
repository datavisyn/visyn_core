import * as React from 'react';
import { StoryObj } from '@storybook/react';
import { ChangeLog } from './ChangeLog';

export default {
  title: 'Example/Ui/ChangeLog',
  component: ChangeLog,
};

type Story = StoryObj<typeof ChangeLog>;

export const Primary: Story = {
  render: () => <ChangeLog c="black" text="PrimaryButton" />,
};

export const Secondary: Story = {
  render: () => <ChangeLog c="pink" text="SecondaryButton" />,
};
