import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Vis } from '../../../LazyVis';
import { VisProvider } from '../../../Provider';
import { ESupportedPlotlyVis } from '../../../interfaces';
import { fetchBreastCancerData } from '../../fetchBreastCancerData';
import { EViolinOverlay, EYAxisMode } from '../../../violin/interfaces';

function VisWrapper(args) {
  const columns = React.useMemo(() => fetchBreastCancerData(), []);
  const [config, setConfig] = useState(args.externalConfig);

  return (
    <VisProvider>
      <div style={{ height: '100vh', width: '100%', display: 'flex', justifyContent: 'center', alignContent: 'center', flexWrap: 'wrap' }}>
        <div style={{ width: '70%', height: '80%' }}>
          <Vis {...args} externalConfig={config} setExternalConfig={setConfig} columns={columns} />
        </div>
      </div>
    </VisProvider>
  );
}

const meta: Meta<typeof VisWrapper> = {
  component: VisWrapper,
  title: 'BoxTest',
};

export default meta;
type Story = StoryObj<typeof VisWrapper>;

export const NoArgs: Story = { args: { externalConfig: { type: ESupportedPlotlyVis.BOXPLOT } } };

export const AlwaysOneColumnStrip: Story = {
  args: {
    externalConfig: {
      type: ESupportedPlotlyVis.BOXPLOT,
      numColumnsSelected: [
        {
          description: 'Gene expression',
          id: 'stat2GeneExpression',
          name: 'STAT2',
        },
      ],
      catColumnSelected: { description: 'some very long description', id: 'breastSurgeryType', name: 'Breast Surgery Type' },
      subCategorySelected: { description: null, id: 'cellularity', name: 'Cellularity' },
      facetBy: { description: 'some very long description', id: 'chemotherapie', name: 'Chemotherapy' },
      overlay: EViolinOverlay.STRIP,
    },
  },
};

export const TwoNumcolsSync: Story = {
  args: {
    externalConfig: {
      type: ESupportedPlotlyVis.BOXPLOT,
      numColumnsSelected: [
        {
          description: 'Gene expression',
          id: 'stat2GeneExpression',
          name: 'STAT2',
        },
        {
          description: 'Gene expression',
          id: 'mycGeneExpression',
          name: 'MYC',
        },
      ],
      subCategorySelected: { description: 'some very long description', id: 'breastSurgeryType', name: 'Breast Surgery Type' },
      syncYAxis: EYAxisMode.SYNC,
    },
  },
};

export const Facets: Story = {
  args: {
    externalConfig: {
      type: ESupportedPlotlyVis.BOXPLOT,
      numColumnsSelected: [
        {
          description: 'Gene expression',
          id: 'stat2GeneExpression',
          name: 'STAT2',
        },
      ],
      facetBy: { description: 'some very long description', id: 'breastSurgeryType', name: 'Breast Surgery Type' },
      syncYAxis: EYAxisMode.UNSYNC,
      overlay: EViolinOverlay.NONE,
    },
  },
};

export const ThreeNumcolsSyncedStrip: Story = {
  args: {
    externalConfig: {
      type: ESupportedPlotlyVis.BOXPLOT,
      numColumnsSelected: [
        {
          description: 'Gene expression',
          id: 'stat2GeneExpression',
          name: 'STAT2',
        },
        {
          description: 'Gene expression',
          id: 'mycGeneExpression',
          name: 'MYC',
        },
        {
          description: 'some very long description',
          id: 'neoplasmHistologicGrade',
          name: 'Neoplasm Histologic Grade',
        },
      ],
      catColumnSelected: { description: 'some very long description', id: 'breastSurgeryType', name: 'Breast Surgery Type' },
      syncYAxis: EYAxisMode.SYNC,
      overlay: EViolinOverlay.STRIP,
    },
  },
};
