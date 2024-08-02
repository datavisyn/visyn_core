import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Vis } from '../../../../LazyVis';
import { VisProvider } from '../../../../Provider';
import { BaseVisConfig, ESupportedPlotlyVis } from '../../../../interfaces';
import { fetchBreastCancerData } from '../../../fetchBreastCancerData';
import { EViolinOverlay, EYAxisMode } from '../../../../violin/interfaces';

function VisWrapper(args) {
  const columns = React.useMemo(() => fetchBreastCancerData(), []);
  const [config, setConfig] = useState<BaseVisConfig>(args.externalConfig);

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
  title: 'ViolinTest',
};

export default meta;
type Story = StoryObj<typeof VisWrapper>;

export const NoArgs: Story = { args: { externalConfig: { type: ESupportedPlotlyVis.VIOLIN } } };

export const AllSettingsBoxUnsynced: Story = {
  args: {
    externalConfig: {
      type: ESupportedPlotlyVis.VIOLIN,
      numColumnsSelected: [
        {
          description: 'Gene expression',
          id: 'stat2GeneExpression',
          name: 'STAT2',
        },
        {
          description: 'some very long description',
          id: 'cohort',
          name: 'Cohort',
        },
      ],
      catColumnSelected: { description: 'some very long description', id: 'breastSurgeryType', name: 'Breast Surgery Type' },
      subCategorySelected: { description: null, id: 'cellularity', name: 'Cellularity' },
      overlay: EViolinOverlay.BOX,
    },
  },
};

export const Facets: Story = {
  args: {
    externalConfig: {
      type: ESupportedPlotlyVis.VIOLIN,
      numColumnsSelected: [
        {
          description: 'Gene expression',
          id: 'stat2GeneExpression',
          name: 'STAT2',
        },
      ],
      catColumnSelected: { description: 'some very long description', id: 'breastSurgeryType', name: 'Breast Surgery Type' },
      subCategorySelected: { description: null, id: 'cellularity', name: 'Cellularity' },
      facetBy: {
        description: 'some very long description',
        id: 'chemotherapie',
        name: 'Chemotherapy',
      },
    },
  },
};

export const FacetsSynced: Story = {
  args: {
    externalConfig: {
      type: ESupportedPlotlyVis.VIOLIN,
      numColumnsSelected: [
        {
          description: 'Gene expression',
          id: 'stat2GeneExpression',
          name: 'STAT2',
        },
      ],
      catColumnSelected: { description: 'some very long description', id: 'breastSurgeryType', name: 'Breast Surgery Type' },
      subCategorySelected: { description: null, id: 'cellularity', name: 'Cellularity' },
      facetBy: {
        description: 'some very long description',
        id: 'chemotherapie',
        name: 'Chemotherapy',
      },
      syncYAxis: EYAxisMode.SYNC,
    },
  },
};

export const NoArgsSubcatStrip: Story = {
  args: {
    externalConfig: {
      type: ESupportedPlotlyVis.VIOLIN,
      numColumnsSelected: [
        {
          description: 'Gene expression',
          id: 'stat2GeneExpression',
          name: 'STAT2',
        },
      ],
      subCategorySelected: { description: null, id: 'cellularity', name: 'Cellularity' },
      overlay: EViolinOverlay.STRIP,
    },
  },
};

export const TwoNumcolsSyncedStrip: Story = {
  args: {
    externalConfig: {
      type: ESupportedPlotlyVis.VIOLIN,
      numColumnsSelected: [
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
      subCategorySelected: {
        description: 'some very long description',
        id: 'breastSurgeryType',
        name: 'Breast Surgery Type',
      },
      syncYAxis: EYAxisMode.SYNC,
      overlay: EViolinOverlay.STRIP,
    },
  },
};
