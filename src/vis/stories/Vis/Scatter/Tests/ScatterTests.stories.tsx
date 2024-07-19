import React, { useState } from 'react';
import { ScatterVis } from '../../../../scatter';
import { Vis } from '../../../../LazyVis';
import { VisProvider } from '../../../../Provider';
import { BaseVisConfig } from '../../../../interfaces';
import { fetchBreastCancerData } from '../../../fetchBreastCancerData';

export default {
  title: 'ScatterTest',
  component: Vis,
};

// eslint-disable-next-line react/function-component-definition
const Template: ComponentStory<typeof Vis> = (args) => {
  const columns = React.useMemo(() => fetchBreastCancerData(), []);

  const [selection, setSelection] = useState<string[]>([]);
  const [config, setConfig] = useState<BaseVisConfig>(args.externalConfig);
  return (
    <VisProvider>
      <div style={{ height: '100vh', width: '100%', display: 'flex', justifyContent: 'center', alignContent: 'center', flexWrap: 'wrap' }}>
        <div style={{ width: '70%', height: '80%' }}>
          <Vis {...args} externalConfig={config} setExternalConfig={setConfig} selected={selection} selectionCallback={setSelection} columns={columns} />
        </div>
      </div>
    </VisProvider>
  );
};

export const TestBasic: typeof Template = Template.bind({}) as typeof Template;
