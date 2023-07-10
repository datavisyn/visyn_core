import React from 'react';
import { ComponentStory } from '@storybook/react';
import * as d3 from 'd3v7';
import { Vis } from '../../../LazyVis';
import {
  EAggregateTypes,
  EColumnTypes,
  ENumericalColorScaleType,
  EScatterSelectSettings,
  ESortTypes,
  ESupportedPlotlyVis,
  VisColumn,
} from '../../../interfaces';

function RNG(seed) {
  const m = 2 ** 35 - 31;
  const a = 185852;
  let s = seed % m;
  return function () {
    return (s = (s * a) % m) / m;
  };
}
function fetchData(numberOfPoints: number): VisColumn[] {
  d3.randomNormal.source(d3.randomLcg(0.5));
  const rng = d3.randomNormal(0.5, 0.3);
  const dataGetter = async () => ({
    value: Array(numberOfPoints)
      .fill(null)
      .map(() => rng() * 100),
    pca_x: Array(numberOfPoints)
      .fill(null)
      .map(() => rng() * 100),
    pca_y: Array(numberOfPoints)
      .fill(null)
      .map(() => rng() * 100),
    category: Array(numberOfPoints)
      .fill(null)
      .map(() => `${parseInt((rng() * 10).toString(), 10).toString()}long`),
    category2: Array(numberOfPoints)
      .fill(null)
      .map(() => `${parseInt((rng() * 10).toString(), 10).toString()}long`),
    category3: Array(numberOfPoints)
      .fill(null)
      .map(() => `${parseInt((rng() * 10).toString(), 10).toString()}long`),
  });

  const dataPromise = dataGetter();

  return [
    {
      info: {
        description: '',
        id: 'pca_x',
        name: 'pca_x',
      },
      type: EColumnTypes.NUMERICAL,
      domain: [0, undefined],
      values: () => dataPromise.then((data) => data.pca_x.map((val, i) => ({ id: i.toString(), val }))),
    },
    {
      info: {
        description: '',
        id: 'pca_y',
        name: 'pca_y',
      },
      type: EColumnTypes.NUMERICAL,
      domain: [0, undefined],
      values: () => dataPromise.then((data) => data.pca_y.map((val, i) => ({ id: i.toString(), val }))),
    },
    {
      info: {
        description: '',
        id: 'value',
        name: 'value',
      },
      domain: [0, 100],

      type: EColumnTypes.NUMERICAL,
      values: () => dataPromise.then((data) => data.value.map((val, i) => ({ id: i.toString(), val }))),
    },
    {
      info: {
        description: '',
        id: 'category',
        name: 'category',
      },
      type: EColumnTypes.CATEGORICAL,
      values: () => dataPromise.then((data) => data.category.map((val, i) => ({ id: i.toString(), val }))),
    },
    {
      info: {
        description: '',
        id: 'category2',
        name: 'category2',
      },
      type: EColumnTypes.CATEGORICAL,
      values: () => dataPromise.then((data) => data.category2.map((val, i) => ({ id: i.toString(), val }))),
    },
    {
      info: {
        description: '',
        id: 'category3',
        name: 'category3',
      },
      type: EColumnTypes.CATEGORICAL,
      values: () => dataPromise.then((data) => data.category3.map((val, i) => ({ id: i.toString(), val }))),
    },
  ];
}

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Vis/Heatmap',
  component: Vis,
  argTypes: {
    pointCount: { control: 'number' },
  },
  args: {
    pointCount: 100000,
  },
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
// eslint-disable-next-line react/function-component-definition
const Template: ComponentStory<typeof Vis> = (args) => {
  // @ts-ignore TODO: The pointCount is an injected property, but we are using typeof Vis such that this prop does not exist.
  const columns = React.useMemo(() => fetchData(args.pointCount), [args.pointCount]);

  const [selected, setSelected] = React.useState<string[]>([]);

  return (
    <div style={{ height: '100vh', width: '100%', display: 'flex', justifyContent: 'center', alignContent: 'center', flexWrap: 'wrap' }}>
      <div style={{ width: '70%', height: '80%' }}>
        <Vis {...args} selected={selected} selectionCallback={setSelected} columns={columns} />
      </div>
    </div>
  );
};
// More on args: https://storybook.js.org/docs/react/writing-stories/args

export const Basic: typeof Template = Template.bind({}) as typeof Template;
Basic.args = {
  externalConfig: {
    type: ESupportedPlotlyVis.HEATMAP,
    catColumnsSelected: [
      {
        description: '',
        id: 'category',
        name: 'category',
      },
      {
        description: '',
        id: 'category2',
        name: 'category2',
      },
    ],
    sortedBy: ESortTypes.CAT_ASC,
    color: null,
    numColorScaleType: ENumericalColorScaleType.SEQUENTIAL,
    aggregateColumn: null,
    aggregateType: EAggregateTypes.COUNT,
  },
};

export const Multiples: typeof Template = Template.bind({}) as typeof Template;
Multiples.args = {
  externalConfig: {
    type: ESupportedPlotlyVis.HEATMAP,
    catColumnsSelected: [
      {
        description: '',
        id: 'category',
        name: 'category',
      },
      {
        description: '',
        id: 'category2',
        name: 'category2',
      },
      {
        description: '',
        id: 'category3',
        name: 'category3',
      },
    ],
    sortedBy: ESortTypes.CAT_ASC,
    color: null,
    numColorScaleType: ENumericalColorScaleType.SEQUENTIAL,
    aggregateColumn: null,
    aggregateType: EAggregateTypes.COUNT,
  },
};
