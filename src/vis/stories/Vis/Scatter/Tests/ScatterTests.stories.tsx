import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ScatterVis } from '../../../../scatter';
import { Vis } from '../../../../LazyVis';
import { VisProvider } from '../../../../Provider';
import { BaseVisConfig, EScatterSelectSettings, ESupportedPlotlyVis } from '../../../../interfaces';
import { fetchBreastCancerData } from '../../../fetchBreastCancerData';
import { ELabelingOptions, ERegressionLineType, IScatterConfig } from '../../../../scatter/interfaces';

function VisWrapper(args) {
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
}

const meta: Meta<typeof VisWrapper> = {
  component: VisWrapper,
  title: 'ScatterTest',
};

export default meta;
type Story = StoryObj<typeof VisWrapper>;

// export default {
//   title: 'ScatterTest',
//   component: Vis,
// };

// eslint-disable-next-line react/function-component-definition
// const Template: ComponentStory<typeof Vis> = (args) => {
//   const columns = React.useMemo(() => fetchBreastCancerData(), []);

//   const [selection, setSelection] = useState<string[]>([]);
//   const [config, setConfig] = useState<BaseVisConfig>(args.externalConfig);

//   console.log(args);
//   console.log(args.externalConfig);

//   return (
//     <VisProvider>
//       <div style={{ height: '100vh', width: '100%', display: 'flex', justifyContent: 'center', alignContent: 'center', flexWrap: 'wrap' }}>
//         <div style={{ width: '70%', height: '80%' }}>
//           <Vis {...args} externalConfig={config} setExternalConfig={setConfig} selected={selection} selectionCallback={setSelection} columns={columns} />
//         </div>
//       </div>
//     </VisProvider>
//   );
// };

// export const TestBasic: typeof Template = Template.bind({}) as typeof Template;

export const Test1: Story = {
  args: {
    externalConfig: {
      type: ESupportedPlotlyVis.SCATTER,
      numColumnsSelected: [
        {
          description: 'some very long description',
          id: 'cohort',
          name: 'Cohort',
        },
        {
          description: 'some very long description',
          id: 'integrativeCluster',
          name: 'Integrative Cluster',
        },
      ],
      color: {
        description: 'some very long description',
        id: 'cohort',
        name: 'Cohort',
      },
      shape: {
        description: 'some very long description',
        id: 'cohort',
        name: 'Cohort',
      },
      dragMode: EScatterSelectSettings.RECTANGLE,
      alphaSliderVal: 0.3,
      showLabels: ELabelingOptions.NEVER,
      regressionLineOptions: {
        type: ERegressionLineType.POLYNOMIAL,
        showStats: true,
      },
    },
  },
};

// export const Test2: typeof Template = Template.bind({}) as typeof Template;
// Test2.args = {
//   externalConfig: {
//     type: ESupportedPlotlyVis.SCATTER,
//     numColumnsSelected: [
//       {
//         description: 'Gene expression',
//         id: 'stat2GeneExpression',
//         name: 'STAT2',
//       },
//       {
//         description: 'Gene expression',
//         id: 'mycGeneExpression',
//         name: 'MYC',
//       },
//     ],
//     color: {
//       description: 'Gene expression',
//       id: 'stat2GeneExpression',
//       name: 'STAT2',
//     },
//     shape: {
//       description: 'Gene expression',
//       id: 'stat2GeneExpression',
//       name: 'STAT2',
//     },
//     dragMode: EScatterSelectSettings.LASSO,
//     alphaSliderVal: 0.8,
//     showLabels: ELabelingOptions.SELECTED,
//     regressionLineOptions: {
//       type: ERegressionLineType.LINEAR,
//       showStats: false,
//     },
//   } as IScatterConfig,
// };

// export const Test3: typeof Template = Template.bind({}) as typeof Template;
// Test3.args = {
//   externalConfig: {
//     showLegend: false,
//     type: ESupportedPlotlyVis.SCATTER,
//     numColumnsSelected: [
//       {
//         description: 'Gene expression',
//         id: 'stat2GeneExpression',
//         name: 'STAT2',
//       },
//       {
//         description: 'Gene expression',
//         id: 'mycGeneExpression',
//         name: 'MYC',
//       },
//     ],
//     color: {
//       description: 'Gene expression',
//       id: 'stat2GeneExpression',
//       name: 'STAT2',
//     },
//     shape: {
//       description: 'Gene expression',
//       id: 'stat2GeneExpression',
//       name: 'STAT2',
//     },
//     dragMode: EScatterSelectSettings.LASSO,
//     alphaSliderVal: 0.8,
//     showLabels: ELabelingOptions.SELECTED,
//     regressionLineOptions: {
//       type: ERegressionLineType.NONE,
//     },
//   } as IScatterConfig,
// };

// export const Test4: typeof Template = Template.bind({}) as typeof Template;
// Test4.args = {
//   externalConfig: {
//     showLegend: false,
//     type: ESupportedPlotlyVis.SCATTER,
//     numColumnsSelected: [
//       {
//         description: 'Gene expression',
//         id: 'stat2GeneExpression',
//         name: 'STAT2',
//       },
//       {
//         description: 'Gene expression',
//         id: 'stat2GeneExpression',
//         name: 'STAT2',
//       },
//     ],
//     color: {
//       description: 'Gene expression',
//       id: 'stat2GeneExpression',
//       name: 'STAT2',
//     },
//     shape: null,
//     dragMode: EScatterSelectSettings.LASSO,
//     alphaSliderVal: 0.8,
//     showLabels: ELabelingOptions.SELECTED,
//     regressionLineOptions: {
//       type: ERegressionLineType.NONE,
//     },
//   } as IScatterConfig,
// };

// export const Test5: typeof Template = Template.bind({}) as typeof Template;
// Test5.args = {
//   externalConfig: {
//     type: ESupportedPlotlyVis.SCATTER,
//     numColumnsSelected: [],
//   } as IScatterConfig,
// };

// export const Test6: typeof Template = Template.bind({}) as typeof Template;
// Test5.args = {
//   externalConfig: {
//     showLegend: false,
//     type: ESupportedPlotlyVis.SCATTER,
//     numColumnsSelected: [
//       {
//         description: 'Gene expression',
//         id: 'stat2GeneExpression',
//         name: 'STAT2',
//       },
//       {
//         description: 'Gene expression',
//         id: 'stat2GeneExpression',
//         name: 'STAT2',
//       },
//     ],
//     color: {
//       description: 'Gene expression',
//       id: 'mycGeneExpression',
//       name: 'MYC',
//     },
//     shape: null,
//     dragMode: EScatterSelectSettings.PAN,
//     alphaSliderVal: 1,
//     showLabels: ELabelingOptions.NEVER,
//     regressionLineOptions: {
//       type: ERegressionLineType.LINEAR,
//     },
//   } as IScatterConfig,
// };