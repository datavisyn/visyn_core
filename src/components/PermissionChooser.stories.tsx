import { Button } from '@mantine/core';
import { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { PermissionChooser } from '.';
import { Permission } from '../security/Permission';

type Story = StoryObj<typeof Button>;

const meta: Meta<typeof Button> = {
  title: 'Components/PermissionChooser',
  component: PermissionChooser,
};

export default meta;

export const Primary: Story = {
  render: () => (
    <PermissionChooser permission={Permission.decode(0)} setPermission={() => null} buddies={[]} setBuddies={() => null} group={''} setGroup={() => null} />
  ),
};
