import { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Vis } from '../../../LazyVis';
import { VisProvider } from '../../../Provider';
import { ECorrelationType } from '../../../correlation/interfaces';
import { BaseVisConfig, EScaleType, ESupportedPlotlyVis } from '../../../interfaces';
import { fetchIrisData } from '../../fetchIrisData';

const meta: Meta<typeof Vis> = {
  title: 'Vis/vistypes/randomData/Correlation',
  component: Vis,
  parameters: {
    chromatic: { delay: 10000, pauseAnimationAtEnd: true },
  },
  render: (args) => {
    const columns = React.useMemo(() => fetchIrisData(), []);

    const [selection, setSelection] = useState<string[]>([]);
    return (
      <VisProvider>
        <div style={{ height: '100vh', width: '100%', display: 'flex', justifyContent: 'center', alignContent: 'center', flexWrap: 'wrap' }}>
          <div style={{ width: '70%', height: '80%' }}>
            <Vis {...args} columns={columns} selected={selection} selectionCallback={setSelection} />
          </div>
        </div>
      </VisProvider>
    );
  },
};

export default meta;
type Story = StoryObj<typeof Vis>;

export const Basic: Story = {
  args: {
    externalConfig: {
      type: ESupportedPlotlyVis.CORRELATION,
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
        {
          description: '',
          id: 'petalLength',
          name: 'Petal Length',
        },
        {
          description: '',
          id: 'petalWidth',
          name: 'Petal Width',
        },
      ],
      correlationType: ECorrelationType.PEARSON,
      pScaleType: EScaleType.LINEAR,
      pDomain: [0.5, 0.01],
    } as BaseVisConfig,
  },
  parameters: {
    chromatic: { delay: 10000, pauseAnimationAtEnd: true },
  },
};

// Basic.parameters = {
//   chromatic: { delay: 10000, pauseAnimationAtEnd: true },
// };
