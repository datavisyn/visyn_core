import { ComponentStory } from '@storybook/react';
import React, { useState } from 'react';
import { Vis } from '../../../LazyVis';
import { VisProvider } from '../../../Provider';
import { EBarDirection, EBarDisplayType, EBarGroupingType } from '../../../bar/interfaces';
import { BaseVisConfig, EAggregateTypes, EColumnTypes, ESupportedPlotlyVis, VisColumn } from '../../../interfaces';

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
    category2: Array(numberOfPoints)
      .fill(null)
      .map(() => parseInt((rng() * 5).toString(), 5).toString()),
    category3: Array(numberOfPoints)
      .fill(null)
      .map(() => parseInt((rng() * 2).toString(), 2).toString()),
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
      values: async () => {
        const data = await dataPromise;
        return data.pca_x.map((val, i) => ({ id: i.toString(), val }));
      },
    },
    {
      info: {
        description: '',
        id: 'pca_y',
        name: 'pca_y',
      },
      type: EColumnTypes.NUMERICAL,
      domain: [0, undefined],
      values: async () => {
        const data = await dataPromise;
        return data.pca_y.map((val, i) => ({ id: i.toString(), val }));
      },
    },
    {
      info: {
        description: '',
        id: 'value',
        name: 'value',
      },
      domain: [0, 100],

      type: EColumnTypes.NUMERICAL,
      values: async () => {
        const data = await dataPromise;
        return data.value.map((val, i) => ({ id: i.toString(), val }));
      },
    },
    {
      info: {
        description: '',
        id: 'category',
        name: 'category',
      },
      type: EColumnTypes.CATEGORICAL,
      values: async () => {
        const data = await dataPromise;
        return data.category.map((val, i) => ({ id: i.toString(), val }));
      },
    },
    {
      info: {
        description: '',
        id: 'category2',
        name: 'category2',
      },
      type: EColumnTypes.CATEGORICAL,
      values: async () => {
        const data = await dataPromise;
        return data.category2.map((val, i) => ({ id: i.toString(), val }));
      },
    },
    {
      info: {
        description: '',
        id: 'category3',
        name: 'category3',
      },
      type: EColumnTypes.CATEGORICAL,
      values: async () => {
        const data = await dataPromise;
        return data.category3.map((val, i) => ({ id: i.toString(), val }));
      },
    },
  ];
}

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Vis/Bar',
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
};
// More on args: https://storybook.js.org/docs/react/writing-stories/args

export const Basic: typeof Template = Template.bind({}) as typeof Template;
Basic.args = {
  externalConfig: {
    aggregateColumn: null,
    aggregateType: EAggregateTypes.COUNT,
    catColumnSelected: { description: '', id: 'category', name: 'category' },
    direction: EBarDirection.HORIZONTAL,
    display: EBarDisplayType.ABSOLUTE,
    group: null,
    groupType: EBarGroupingType.GROUP,
    multiples: null,
    numColumnsSelected: [],
    type: ESupportedPlotlyVis.BAR,
  } as BaseVisConfig,
};

export const Vertical: typeof Template = Template.bind({}) as typeof Template;
Vertical.args = {
  externalConfig: {
    type: ESupportedPlotlyVis.BAR,
    catColumnSelected: {
      description: '',
      id: 'category',
      name: 'category',
    },
    multiples: null,
    group: null,
    groupType: EBarGroupingType.GROUP,
    direction: EBarDirection.VERTICAL,
    display: EBarDisplayType.ABSOLUTE,
    aggregateType: EAggregateTypes.COUNT,
    aggregateColumn: null,
    numColumnsSelected: [],
  } as BaseVisConfig,
};

export const Grouped: typeof Template = Template.bind({}) as typeof Template;
Grouped.args = {
  externalConfig: {
    type: ESupportedPlotlyVis.BAR,
    catColumnSelected: {
      description: '',
      id: 'category',
      name: 'category',
    },
    multiples: null,
    group: {
      description: '',
      id: 'category2',
      name: 'category2',
    },
    groupType: EBarGroupingType.GROUP,
    direction: EBarDirection.HORIZONTAL,
    display: EBarDisplayType.ABSOLUTE,
    aggregateType: EAggregateTypes.COUNT,
    aggregateColumn: null,
    numColumnsSelected: [],
  } as BaseVisConfig,
};

export const GroupedStack: typeof Template = Template.bind({}) as typeof Template;
GroupedStack.args = {
  externalConfig: {
    type: ESupportedPlotlyVis.BAR,
    catColumnSelected: {
      description: '',
      id: 'category',
      name: 'category',
    },
    multiples: null,
    group: {
      description: '',
      id: 'category2',
      name: 'category2',
    },
    groupType: EBarGroupingType.STACK,
    direction: EBarDirection.HORIZONTAL,
    display: EBarDisplayType.ABSOLUTE,
    aggregateType: EAggregateTypes.COUNT,
    aggregateColumn: null,
    numColumnsSelected: [],
  } as BaseVisConfig,
};

export const GroupedNumerical: typeof Template = Template.bind({}) as typeof Template;
GroupedNumerical.args = {
  externalConfig: {
    type: ESupportedPlotlyVis.BAR,
    catColumnSelected: {
      description: '',
      id: 'category',
      name: 'category',
    },
    multiples: null,
    group: {
      description: '',
      id: 'pca_y',
      name: 'pca_y',
    },
    groupType: EBarGroupingType.GROUP,
    direction: EBarDirection.HORIZONTAL,
    display: EBarDisplayType.ABSOLUTE,
    aggregateType: EAggregateTypes.COUNT,
    aggregateColumn: null,
    numColumnsSelected: [],
  } as BaseVisConfig,
};

export const GroupedNumericalStack: typeof Template = Template.bind({}) as typeof Template;
GroupedNumericalStack.args = {
  externalConfig: {
    type: ESupportedPlotlyVis.BAR,
    catColumnSelected: {
      description: '',
      id: 'category',
      name: 'category',
    },
    multiples: null,
    group: {
      description: '',
      id: 'pca_y',
      name: 'pca_y',
    },
    groupType: EBarGroupingType.STACK,
    direction: EBarDirection.HORIZONTAL,
    display: EBarDisplayType.ABSOLUTE,
    aggregateType: EAggregateTypes.COUNT,
    aggregateColumn: null,
    numColumnsSelected: [],
  } as BaseVisConfig,
};

export const Multiples: typeof Template = Template.bind({}) as typeof Template;
Multiples.args = {
  externalConfig: {
    type: ESupportedPlotlyVis.BAR,
    catColumnSelected: {
      description: '',
      id: 'category',
      name: 'category',
    },
    multiples: {
      description: '',
      id: 'category2',
      name: 'category2',
    },
    group: null,
    groupType: EBarGroupingType.GROUP,
    direction: EBarDirection.HORIZONTAL,
    display: EBarDisplayType.ABSOLUTE,
    aggregateType: EAggregateTypes.COUNT,
    aggregateColumn: null,
    numColumnsSelected: [],
  } as BaseVisConfig,
};

export const MultiplesAndGrouped: typeof Template = Template.bind({}) as typeof Template;
MultiplesAndGrouped.args = {
  externalConfig: {
    type: ESupportedPlotlyVis.BAR,
    catColumnSelected: {
      description: '',
      id: 'category',
      name: 'category',
    },
    multiples: {
      description: '',
      id: 'category2',
      name: 'category2',
    },
    group: {
      description: '',
      id: 'category3',
      name: 'category3',
    },
    groupType: EBarGroupingType.GROUP,
    direction: EBarDirection.HORIZONTAL,
    display: EBarDisplayType.ABSOLUTE,
    aggregateType: EAggregateTypes.COUNT,
    aggregateColumn: null,
    numColumnsSelected: [],
  } as BaseVisConfig,
};

export const MultiplesAndGroupedStack: typeof Template = Template.bind({}) as typeof Template;
MultiplesAndGroupedStack.args = {
  externalConfig: {
    type: ESupportedPlotlyVis.BAR,
    catColumnSelected: {
      description: '',
      id: 'category',
      name: 'category',
    },
    multiples: {
      description: '',
      id: 'category2',
      name: 'category2',
    },
    group: {
      description: '',
      id: 'category3',
      name: 'category3',
    },
    groupType: EBarGroupingType.STACK,
    direction: EBarDirection.HORIZONTAL,
    display: EBarDisplayType.ABSOLUTE,
    aggregateType: EAggregateTypes.COUNT,
    aggregateColumn: null,
    numColumnsSelected: [],
  } as BaseVisConfig,
};

export const AggregateAverage: typeof Template = Template.bind({}) as typeof Template;
AggregateAverage.args = {
  externalConfig: {
    type: ESupportedPlotlyVis.BAR,
    catColumnSelected: {
      description: '',
      id: 'category',
      name: 'category',
    },
    multiples: null,
    group: null,
    groupType: EBarGroupingType.GROUP,
    direction: EBarDirection.HORIZONTAL,
    display: EBarDisplayType.ABSOLUTE,
    aggregateType: EAggregateTypes.AVG,
    aggregateColumn: {
      description: '',
      id: 'value',
      name: 'value',
    },
    numColumnsSelected: [],
  } as BaseVisConfig,
};
