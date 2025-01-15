import { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { EBarDirection, EBarDisplayType, EBarGroupingType } from '../bar/interfaces';
import { ESupportedPlotlyVis, ENumericalColorScaleType, EScatterSelectSettings, BaseVisConfig, EAggregateTypes } from '../interfaces';
import { Vis } from '../LazyVis';
import { EViolinOverlay } from '../violin/interfaces';
import { fetchIrisData } from './fetchIrisData';

const meta: Meta<typeof Vis> = {
  title: 'Vis/vistypes/IrisData/IrisData',
  component: Vis,
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const columns = React.useMemo(() => fetchIrisData(), []);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [selection, setSelection] = useState<string[]>([]);
    return (
      <div style={{ height: '100vh', width: '100%', display: 'flex', justifyContent: 'center', alignContent: 'center', flexWrap: 'wrap' }}>
        <div style={{ width: '70%', height: '80%' }}>
          <Vis {...args} columns={columns} selected={selection} selectionCallback={setSelection} />
        </div>
      </div>
    );
  },
};

export default meta;
type Story = StoryObj<typeof Vis>;

export const ScatterPlot: Story = {
  args: {
    showDragModeOptions: true,
    externalConfig: {
      type: ESupportedPlotlyVis.SCATTER,
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
      color: {
        description: '',
        id: 'species',
        name: 'Species',
      },
      numColorScaleType: ENumericalColorScaleType.SEQUENTIAL,
      shape: null,
      dragMode: EScatterSelectSettings.RECTANGLE,
      alphaSliderVal: 1,
    } as BaseVisConfig,
  },
};

export const BarChart: Story = {
  args: {
    externalConfig: {
      type: ESupportedPlotlyVis.BAR,
      facets: null,
      group: null,
      direction: EBarDirection.VERTICAL,
      display: EBarDisplayType.ABSOLUTE,
      groupType: EBarGroupingType.GROUP,
      numColumnsSelected: [],
      catColumnSelected: null,
      aggregateColumn: null,
      aggregateType: EAggregateTypes.COUNT,
    } as BaseVisConfig,
  },
};

export const ViolinPlot: Story = {
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
