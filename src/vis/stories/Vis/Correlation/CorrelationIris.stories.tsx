import { ComponentStory } from '@storybook/react';
import React, { useState } from 'react';
import { Vis } from '../../../LazyVis';
import { ECorrelationType } from '../../../correlation/interfaces';
import { BaseVisConfig, EScaleType, ESupportedPlotlyVis } from '../../../interfaces';
import { fetchIrisData } from '../../fetchIrisData';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Vis/Correlation',
  component: Vis,
  parameters: {
    chromatic: { delay: 10000, pauseAnimationAtEnd: true },
  },
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
// eslint-disable-next-line react/function-component-definition
const Template: ComponentStory<typeof Vis> = (args) => {
  const columns = React.useMemo(() => fetchIrisData(), []);

  const [selection, setSelection] = useState<string[]>([]);
  return (
    <div style={{ height: '100vh', width: '100%', display: 'flex', justifyContent: 'center', alignContent: 'center', flexWrap: 'wrap' }}>
      <div style={{ width: '70%', height: '80%' }}>
        <Vis {...args} columns={columns} selected={selection} selectionCallback={setSelection} />
      </div>
    </div>
  );
};

// More on args: https://storybook.js.org/docs/react/writing-stories/args

export const Basic: typeof Template = Template.bind({}) as typeof Template;
Basic.args = {
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
};

Basic.parameters = {
  chromatic: { delay: 10000, pauseAnimationAtEnd: true },
};
