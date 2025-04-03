import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { Vis } from '../../../../LazyVis';
import { VisProvider } from '../../../../Provider';
import { EBarDirection, EBarDisplayType, EBarGroupingType } from '../../../../bar';
import { EAggregateTypes, ESupportedPlotlyVis } from '../../../../interfaces';
import { fetchBreastCancerData } from '../../../fetchBreastCancerData';

type MetaArgs = Parameters<typeof Vis>[0];

function VisWrapper(args: Parameters<NonNullable<typeof meta.render>>[0]) {
  const columns = React.useMemo(() => fetchBreastCancerData(), []);
  const [selection, setSelection] = React.useState<string[]>([]);

  return (
    <VisProvider>
      <div style={{ height: '100vh', width: '100%', display: 'flex', justifyContent: 'center', alignContent: 'center', flexWrap: 'wrap' }}>
        <div style={{ width: '70%', height: '80%' }}>
          <Vis {...args} columns={columns} selected={selection} selectionCallback={setSelection} />
        </div>
      </div>
    </VisProvider>
  );
}

const meta: Meta<MetaArgs> = {
  title: 'Vis/vistypes/breastCancerData/Bar',
  component: Vis,
  render: VisWrapper,
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;
type Story = StoryObj<typeof Vis>;

export const Basic: Story = {
  args: {
    externalConfig: {
      type: ESupportedPlotlyVis.BAR,
      catColumnSelected: {
        description: 'Type of breast surgery',
        id: 'breastSurgeryType',
        name: 'Breast Surgery Type',
      },
      facets: null,
      group: null,
      groupType: EBarGroupingType.STACK,
      direction: EBarDirection.HORIZONTAL,
      display: EBarDisplayType.ABSOLUTE,
      aggregateType: EAggregateTypes.COUNT,
      aggregateColumn: null,
      numColumnsSelected: [],
      showColumnDescriptionText: true,
    },
  },
};
