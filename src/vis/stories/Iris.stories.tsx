import React, { useState } from 'react';
import { ComponentStory, ComponentMeta, StoryFn } from '@storybook/react';
import { Vis } from '../LazyVis';
import {
  EAggregateTypes,
  EBarDirection,
  EBarDisplayType,
  EBarGroupingType,
  EColumnTypes,
  ENumericalColorScaleType,
  EScatterSelectSettings,
  ESupportedPlotlyVis,
  EViolinOverlay,
  VisColumn,
} from '../interfaces';
import { data } from './heatmapData';

export function fetchIrisData(): VisColumn[] {
  const dataPromise = import('./irisData').then((m) => m.iris);

  const heatmapData = data;

  const myData: Record<number, { year: string; state: string }> = {};

  let counter = 0;
  heatmapData.forEach((state) => {
    for (let i = 0; i < Math.round(state.value / 100); i++) {
      myData[counter] = { year: state.x.toString(), state: state.y };
      counter += 1;
    }
  });

  console.log(myData);

  return [
    {
      info: {
        description: '',
        id: 'state',
        name: 'US States',
      },
      type: EColumnTypes.CATEGORICAL,
      values: () => Object.keys(myData).map((d) => ({ val: myData[d].state, id: d })),
    },
    {
      info: {
        description: 'data from description',
        id: 'petalLength',
        name: 'Petal Length PEtal length petal length',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => dataPromise.then((d) => d.map((r) => r.petalLength).map((val, i) => ({ id: i.toString(), val }))),
    },
    {
      info: {
        description: '',
        id: 'year',
        name: 'Years',
      },
      type: EColumnTypes.CATEGORICAL,
      values: () => Object.keys(myData).map((d) => ({ val: myData[d].year, id: d })),
    },
  ];
}

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/Vis/IrisData',
  component: Vis,
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

export const ScatterPlot: typeof Template = Template.bind({});
ScatterPlot.args = {
  showDragModeOptions: false,
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
  },
};

export const BarChart: typeof Template = Template.bind({});
BarChart.args = {
  externalConfig: {
    type: ESupportedPlotlyVis.BAR,
    multiples: null,
    group: null,
    direction: EBarDirection.VERTICAL,
    display: EBarDisplayType.ABSOLUTE,
    groupType: EBarGroupingType.GROUP,
    numColumnsSelected: [],
    catColumnSelected: {
      description: '',
      id: 'species',
      name: 'Species',
    },
    aggregateColumn: null,
    aggregateType: EAggregateTypes.COUNT,
  },
};

export const ViolinPlot: typeof Template = Template.bind({});
ViolinPlot.args = {
  externalConfig: {
    type: ESupportedPlotlyVis.VIOLIN,
    numColumnsSelected: [
      {
        description: 'data from description',
        id: 'petalLength',
        name: 'Petal Length PEtal length petal length',
      },
    ],
    catColumnsSelected: [],
    violinOverlay: EViolinOverlay.NONE,
  },
};
