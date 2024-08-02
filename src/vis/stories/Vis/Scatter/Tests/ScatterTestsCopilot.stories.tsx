import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Vis } from '../../../../LazyVis';
import { VisProvider } from '../../../../Provider';
import { BaseVisConfig, ESupportedPlotlyVis } from '../../../../interfaces';
import { fetchBreastCancerData } from '../../../fetchBreastCancerData';
import { ELabelingOptions, ERegressionLineType } from '../../../../scatter/interfaces';

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
  title: 'ScatterTestCopilot',
};

export default meta;
type Story = StoryObj<typeof VisWrapper>;

export const NoArgs: Story = { args: {} };

export const ColorShapePolynomial: Story = {
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
      regressionLine: {
        type: ERegressionLineType.POLYNOMIAL,
        order: 2,
      },
      labelingOptions: {
        type: ELabelingOptions.ALWAYS,
        customLabel: 'custom label',
      },
    },
  },
};

/*
        {
          description: 'Gene expression',
          id: 'brca2GeneExpression',
          name: 'BRCA2',
        },
        {
          description: 'Gene expression',
          id: 'mycGeneExpression',
          name: 'MYC',
        },
        { description: 'some very long description', id: 'breastSurgeryType', name: 'Breast Surgery Type' }
         {
          description: 'Gene expression',
          id: 'stat2GeneExpression',
          name: 'STAT2',
        },
        {
          description: 'Gene expression',
          id: 'brca1GeneExpression',
          name: 'BRCA1',
        },
*/

export const ColorShapeLinear: Story = {
  args: {
    externalConfig: {
      type: ESupportedPlotlyVis.SCATTER,
      numColumnsSelected: [
        {
          description: 'Gene expression',
          id: 'brca2GeneExpression',
          name: 'BRCA2',
        },
        {
          description: 'Gene expression',
          id: 'mycGeneExpression',
          name: 'MYC',
        },
      ],
      color: {
        description: 'Gene expression',
        id: 'brca2GeneExpression',
        name: 'BRCA2',
      },
      shape: {
        description: 'Gene expression',
        id: 'mycGeneExpression',
        name: 'MYC',
      },
      regressionLine: {
        type: ERegressionLineType.LINEAR,
      },
      labelingOptions: {
        type: ELabelingOptions.ALWAYS,
        customLabel: 'custom label',
      },
    },
  },
};

export const ColorShapeNone: Story = {
  args: {
    externalConfig: {
      type: ESupportedPlotlyVis.SCATTER,
      numColumnsSelected: [
        {
          description: 'Gene expression',
          id: 'stat2GeneExpression',
          name: 'STAT2',
        },
        {
          description: 'Gene expression',
          id: 'brca1GeneExpression',
          name: 'BRCA1',
        },
      ],
      color: {
        description: 'Gene expression',
        id: 'stat2GeneExpression',
        name: 'STAT2',
      },
      shape: {
        description: 'Gene expression',
        id: 'brca1GeneExpression',
        name: 'BRCA1',
      },
      regressionLine: {
        type: ERegressionLineType.NONE,
      },
      labelingOptions: {
        type: ELabelingOptions.ALWAYS,
        customLabel: 'custom label',
      },
    },
  },
};

export const ColorShapeExponential: Story = {
  args: {
    externalConfig: {
      type: ESupportedPlotlyVis.SCATTER,
      numColumnsSelected: [
        {
          description: 'Gene expression',
          id: 'brca2GeneExpression',
          name: 'BRCA2',
        },
        {
          description: 'Gene expression',
          id: 'stat2GeneExpression',
          name: 'STAT2',
        },
      ],
      color: {
        description: 'Gene expression',
        id: 'brca2GeneExpression',
        name: 'BRCA2',
      },
      shape: {
        description: 'Gene expression',
        id: 'stat2GeneExpression',
        name: 'STAT2',
      },
      regressionLine: {
        type: ERegressionLineType.LINEAR,
      },
      labelingOptions: {
        type: ELabelingOptions.ALWAYS,
        customLabel: 'custom label',
      },
    },
  },
};
