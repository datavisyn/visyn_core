import { ComponentStory } from '@storybook/react';
import React from 'react';
import { Vis } from '../../../LazyVis';
import { VisProvider } from '../../../Provider';
import { EHexbinOptions } from '../../../hexbin/interfaces';
import { BaseVisConfig, EColumnTypes, EScatterSelectSettings, ESupportedPlotlyVis, VisColumn } from '../../../interfaces';

function RNG(seed) {
  const m = 2 ** 35 - 31;
  const a = 185852;
  let s = seed % m;
  return function () {
    return (s = (s * a) % m) / m;
  };
}

function fetchData(numberOfPoints: number): VisColumn[] {
  const rng = RNG(10);

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
      .map(() => parseInt((rng() * 10).toString(), 10).toString()),
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
  ];
}

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Vis/Hexbin',
  component: Vis,
  argTypes: {
    pointCount: { control: 'number' },
  },
  args: {
    pointCount: 10000,
  },
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
// eslint-disable-next-line react/function-component-definition
const Template: ComponentStory<typeof Vis> = (args) => {
  // @ts-ignore TODO: The pointCount is an injected property, but we are using typeof Vis such that this prop does not exist.
  const columns = React.useMemo(() => fetchData(args.pointCount), [args.pointCount]);

  return (
    <VisProvider>
      <div style={{ height: '100vh', width: '100%', display: 'flex', justifyContent: 'center', alignContent: 'center', flexWrap: 'wrap' }}>
        <div style={{ width: '70%', height: '80%' }}>
          <Vis {...args} columns={columns} />
        </div>
      </div>
    </VisProvider>
  );
};
// More on args: https://storybook.js.org/docs/react/writing-stories/args

export const LargeData: typeof Template = Template.bind({}) as typeof Template;
LargeData.args = {
  externalConfig: {
    type: ESupportedPlotlyVis.HEXBIN,
    numColumnsSelected: [
      {
        description: '',
        id: 'pca_x',
        name: 'pca_x',
      },
      {
        description: '',
        id: 'pca_y',
        name: 'pca_y',
      },
    ],
    color: null,
    dragMode: EScatterSelectSettings.RECTANGLE,
    hexRadius: 20,
    isOpacityScale: true,
    isSizeScale: false,
    hexbinOptions: EHexbinOptions.COLOR,
  } as BaseVisConfig,
};

export const LargeDataMultiples: typeof Template = Template.bind({}) as typeof Template;
LargeDataMultiples.args = {
  externalConfig: {
    type: ESupportedPlotlyVis.HEXBIN,
    numColumnsSelected: [
      {
        description: '',
        id: 'pca_x',
        name: 'pca_x',
      },
      {
        description: '',
        id: 'pca_y',
        name: 'pca_y',
      },
      {
        description: '',
        id: 'value',
        name: 'value',
      },
    ],
    color: null,
    dragMode: EScatterSelectSettings.RECTANGLE,
    hexRadius: 20,
    isOpacityScale: true,
    isSizeScale: false,
    hexbinOptions: EHexbinOptions.COLOR,
  } as BaseVisConfig,
};

export const ColorByCategory: typeof Template = Template.bind({}) as typeof Template;
ColorByCategory.args = {
  externalConfig: {
    type: ESupportedPlotlyVis.HEXBIN,
    numColumnsSelected: [
      {
        description: '',
        id: 'pca_x',
        name: 'pca_x',
      },
      {
        description: '',
        id: 'pca_y',
        name: 'pca_y',
      },
    ],
    color: {
      description: '',
      id: 'category',
      name: 'category',
    },
    dragMode: EScatterSelectSettings.RECTANGLE,
    hexRadius: 20,
    isOpacityScale: true,
    isSizeScale: false,
    hexbinOptions: EHexbinOptions.COLOR,
  } as BaseVisConfig,
};

export const PieCharts: typeof Template = Template.bind({}) as typeof Template;
PieCharts.args = {
  externalConfig: {
    type: ESupportedPlotlyVis.HEXBIN,
    numColumnsSelected: [
      {
        description: '',
        id: 'pca_x',
        name: 'pca_x',
      },
      {
        description: '',
        id: 'pca_y',
        name: 'pca_y',
      },
    ],
    color: {
      description: '',
      id: 'category',
      name: 'category',
    },
    dragMode: EScatterSelectSettings.RECTANGLE,
    hexRadius: 20,
    isOpacityScale: true,
    isSizeScale: false,
    hexbinOptions: EHexbinOptions.PIE,
  } as BaseVisConfig,
};

export const ColorBins: typeof Template = Template.bind({}) as typeof Template;
ColorBins.args = {
  externalConfig: {
    type: ESupportedPlotlyVis.HEXBIN,
    numColumnsSelected: [
      {
        description: '',
        id: 'pca_x',
        name: 'pca_x',
      },
      {
        description: '',
        id: 'pca_y',
        name: 'pca_y',
      },
    ],
    color: {
      description: '',
      id: 'category',
      name: 'category',
    },
    dragMode: EScatterSelectSettings.RECTANGLE,
    hexRadius: 20,
    isOpacityScale: true,
    isSizeScale: false,
    hexbinOptions: EHexbinOptions.BINS,
  } as BaseVisConfig,
};
