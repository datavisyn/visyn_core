import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from '@storybook/preview-api';
// import { useArgs } from '@storybook/client-api';

import { SortIcon, ESortStates } from './SortIcon';

const meta: Meta<typeof SortIcon> = {
  component: SortIcon,
  title: 'components/SortIcon',
  decorators: [
    function Component(Story, ctx) {
      const [, setArgs] = useArgs();

      const setSortState = (value: ESortStates) => {
        ctx.args.setSortState?.(value, false, {} as any);

        // Check if the component is controlled
        if (ctx.args.sortState !== undefined) {
          // Update the arg in Storybook
          setArgs({ sortState: value });
        }
      };

      // Forward all args and overwrite setSortState
      return <Story args={{ ...ctx.args, setSortState }} />;
    },
  ],
};

export default meta;
type Story = StoryObj<typeof SortIcon>;

export const Default: Story = {};
