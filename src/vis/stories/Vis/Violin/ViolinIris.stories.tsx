import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import { Vis } from '../../../LazyVis';
import { VisProvider } from '../../../Provider';
import { BaseVisConfig, ESupportedPlotlyVis } from '../../../interfaces';
import { EViolinOverlay } from '../../../violin/interfaces';
import { fetchIrisData } from '../../fetchIrisData';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof Vis> = {
  title: 'Vis/vistypes/randomData/Violin',
  component: Vis,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const columns = React.useMemo(() => fetchIrisData(), []);
    return (
      <VisProvider>
        <div style={{ height: '100vh', width: '100%', display: 'flex', justifyContent: 'center', alignContent: 'center', flexWrap: 'wrap' }}>
          <div style={{ width: '70%', height: '80%' }}>
            <Vis {...args} columns={columns} />
          </div>
        </div>
      </VisProvider>
    );
  },
};

export default meta;
type Story = StoryObj<typeof Vis>;

// More on args: https://storybook.js.org/docs/react/writing-stories/args

export const Basic: Story = {
  args: {
    externalConfig: {
      type: ESupportedPlotlyVis.VIOLIN,
      numColumnsSelected: [
        {
          description: '',
          id: 'sepalLength',
          name: 'Sepal Length',
        },
        {
          description: '',
          id: 'sepalWidth',
          name: 'Sepal Width',
        },
      ],
      catColumnsSelected: [
        {
          description: '',
          id: 'species',
          name: 'Species',
        },
      ],
      violinOverlay: EViolinOverlay.NONE,
    } as BaseVisConfig,
  },
};

export const BoxplotOverlay: Story = {
  args: {
    externalConfig: {
      type: ESupportedPlotlyVis.VIOLIN,
      numColumnsSelected: [
        {
          description: '',
          id: 'sepalLength',
          name: 'Sepal Length',
        },
        {
          description: '',
          id: 'sepalWidth',
          name: 'Sepal Width',
        },
      ],
      catColumnsSelected: [
        {
          description: '',
          id: 'species',
          name: 'Species',
        },
      ],
      overlay: EViolinOverlay.BOX,
    } as BaseVisConfig,
  },
};
