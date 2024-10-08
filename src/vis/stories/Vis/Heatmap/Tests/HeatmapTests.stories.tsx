import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Vis } from '../../../../LazyVis';
import { VisProvider } from '../../../../Provider';
import { BaseVisConfig, EAggregateTypes, ENumericalColorScaleType, ESupportedPlotlyVis } from '../../../../interfaces';
import { fetchBreastCancerData } from '../../../fetchBreastCancerData';
import { ESortTypes } from '../../../../heatmap/interfaces';

function VisWrapper(args) {
  const columns = React.useMemo(() => fetchBreastCancerData(), []);
  const [selection, setSelection] = useState<string[]>([]);
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
  title: 'HeatmapTest',
};

export default meta;
type Story = StoryObj<typeof VisWrapper>;

export const NoArgs: Story = { args: { externalConfig: { type: ESupportedPlotlyVis.HEATMAP } } };

export const OneCatColumn: Story = {
  args: {
    externalConfig: {
      type: ESupportedPlotlyVis.HEATMAP,
      catColumnsSelected: [
        {
          description: 'some very long description',
          id: 'breastSurgeryType',
          name: 'Breast Surgery Type',
        },
      ],
      xSortedBy: ESortTypes.NONE,
      ySortedBy: ESortTypes.NONE,
      color: null,
      numColorScaleType: ENumericalColorScaleType.DIVERGENT,
      aggregateColumn: null,
      aggregateType: EAggregateTypes.COUNT,
    },
  },
};

export const AllArgs: Story = {
  args: {
    externalConfig: {
      type: ESupportedPlotlyVis.HEATMAP,
      catColumnsSelected: [
        {
          description: 'some very long description',
          id: 'breastSurgeryType',
          name: 'Breast Surgery Type',
        },
        { description: null, id: 'cellularity', name: 'Cellularity' },
      ],
      xSortedBy: ESortTypes.NONE,
      ySortedBy: ESortTypes.NONE,
      color: null,
      numColorScaleType: ENumericalColorScaleType.DIVERGENT,
      aggregateColumn: {
        description: 'Gene expression',
        id: 'stat2GeneExpression',
        name: 'STAT2',
      },
      aggregateType: EAggregateTypes.AVG,
    },
  },
};

export const SortMin: Story = {
  args: {
    externalConfig: {
      type: ESupportedPlotlyVis.HEATMAP,
      catColumnsSelected: [
        {
          description: 'some very long description',
          id: 'breastSurgeryType',
          name: 'Breast Surgery Type',
        },
        { description: null, id: 'cellularity', name: 'Cellularity' },
      ],
      xSortedBy: ESortTypes.CAT_DESC,
      ySortedBy: ESortTypes.CAT_ASC,
      color: null,
      numColorScaleType: ENumericalColorScaleType.SEQUENTIAL,
      aggregateColumn: {
        description: 'Gene expression',
        id: 'stat2GeneExpression',
        name: 'STAT2',
      },
      aggregateType: EAggregateTypes.MIN,
    },
  },
};

export const SortMedian: Story = {
  args: {
    externalConfig: {
      type: ESupportedPlotlyVis.HEATMAP,
      catColumnsSelected: [
        {
          description: 'some very long description',
          id: 'breastSurgeryType',
          name: 'Breast Surgery Type',
        },
        { description: null, id: 'cellularity', name: 'Cellularity' },
      ],
      xSortedBy: ESortTypes.CAT_ASC,
      ySortedBy: ESortTypes.CAT_DESC,
      color: null,
      numColorScaleType: ENumericalColorScaleType.DIVERGENT,
      aggregateColumn: { description: 'some very long description', id: 'cohort', name: 'Cohort' },
      aggregateType: EAggregateTypes.MED,
    },
  },
};

export const Count: Story = {
  args: {
    externalConfig: {
      type: ESupportedPlotlyVis.HEATMAP,
      catColumnsSelected: [
        {
          description: 'some very long description',
          id: 'breastSurgeryType',
          name: 'Breast Surgery Type',
        },
        { description: null, id: 'cellularity', name: 'Cellularity' },
      ],
      xSortedBy: ESortTypes.NONE,
      ySortedBy: ESortTypes.NONE,
      color: null,
      numColorScaleType: ENumericalColorScaleType.SEQUENTIAL,
      aggregateColumn: null,
      aggregateType: EAggregateTypes.COUNT,
    },
  },
};
