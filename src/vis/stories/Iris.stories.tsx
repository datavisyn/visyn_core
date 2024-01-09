import { ComponentStory } from '@storybook/react';
import React, { useState } from 'react';
import { Vis } from '../LazyVis';
import { EBarDirection, EBarDisplayType, EBarGroupingType } from '../bar/interfaces';
import { BaseVisConfig, EAggregateTypes, EColumnTypes, ENumericalColorScaleType, EScatterSelectSettings, ESupportedPlotlyVis, VisColumn } from '../interfaces';
import { EViolinOverlay } from '../violin/interfaces';

export function fetchIrisData(): VisColumn[] {
  const dataPromise = import('./irisData').then((m) =>
    m.iris.map((currIris) => ({ ...currIris, randomCategory: Math.round(Math.random() * 20), anotherRandomCategory: Math.round(Math.random() * 4) })),
  );

  return [
    {
      info: {
        description: 'data from description',
        id: 'sepalLength',
        name: 'Sepal Length',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => dataPromise.then((data) => data.map((r) => r.sepalLength).map((val, i) => ({ id: i.toString(), val }))),
    },
    {
      info: {
        description: 'data from description',
        id: 'sepalWidth',
        name: 'Sepal Width',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => dataPromise.then((data) => data.map((r) => r.sepalWidth).map((val, i) => ({ id: i.toString(), val }))),
    },
    {
      info: {
        description: '',
        id: 'randomThing',
        name: 'Random Thing',
      },
      type: EColumnTypes.CATEGORICAL,
      values: () => dataPromise.then((data) => data.map((r) => r.randomCategory).map((val, i) => ({ id: i.toString(), val: val.toString() }))),
    },
    {
      info: {
        description: '',
        id: 'randomThing2',
        name: 'Random Thing2',
      },
      type: EColumnTypes.CATEGORICAL,
      values: () => dataPromise.then((data) => data.map((r) => r.anotherRandomCategory).map((val, i) => ({ id: i.toString(), val: val.toString() }))),
    },
    {
      info: {
        description: 'data from description',
        id: 'petalLength',
        name: 'Petal Length',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => dataPromise.then((data) => data.map((r) => r.petalLength).map((val, i) => ({ id: i.toString(), val }))),
    },
    {
      info: {
        description: 'data from description',
        id: 'petalWidth',
        name: 'Petal Width',
      },
      type: EColumnTypes.NUMERICAL,
      values: () => dataPromise.then((data) => data.map((r) => r.petalWidth).map((val, i) => ({ id: i.toString(), val }))),
    },
    {
      info: {
        description: 'data from description',
        id: 'species',
        name: 'Species',
      },
      isLabel: true,
      type: EColumnTypes.CATEGORICAL,
      values: () => dataPromise.then((data) => data.map((r) => r.species).map((val, i) => ({ id: i.toString(), val }))),
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
      id: 'randomThing',
      name: 'Random Thing',
    },
    aggregateColumn: null,
    aggregateType: EAggregateTypes.COUNT,
  } as BaseVisConfig,
};

export const ViolinPlot: typeof Template = Template.bind({});
ViolinPlot.args = {
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
};
