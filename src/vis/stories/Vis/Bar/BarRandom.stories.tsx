import { ComponentStory } from '@storybook/react';
import React from 'react';
import { EBarDirection, EBarDisplayType, EBarGroupingType, EBarSortState } from '../../../bar/interfaces';
import { BaseVisConfig, EAggregateTypes, EColumnTypes, ESupportedPlotlyVis, VisColumn } from '../../../interfaces';
import { Vis } from '../../../LazyVis';
import { VisProvider } from '../../../Provider';

function RNG(seed: number, sign: 'positive' | 'negative' | 'mixed' = 'positive') {
  const m = 2 ** 35 - 31;
  const a = 185852;
  let s = seed % m;
  return () => {
    let value = ((s = (s * a) % m) / m) * 2 - 1; // Generate values between -1 and 1
    if (sign === 'positive') {
      value = Math.abs(value);
    } else if (sign === 'negative') {
      value = -Math.abs(value);
    }
    return value;
  };
}

function fetchData(numberOfPoints: number): VisColumn[] {
  const positiveRNG = RNG(10, 'positive');
  const negativeRNG = RNG(10, 'negative');
  const mixedRNG = RNG(10, 'mixed');

  const dataGetter = async () => ({
    positiveNumbers: Array(numberOfPoints)
      .fill(null)
      .map(() => positiveRNG() * numberOfPoints),
    negativeNumbers: Array(numberOfPoints)
      .fill(null)
      .map(() => negativeRNG() * numberOfPoints),
    randomNumbers: Array(numberOfPoints)
      .fill(null)
      .map(() => mixedRNG() * numberOfPoints),
    singleNumber: Array(numberOfPoints)
      .fill(null)
      .map(() => RNG(numberOfPoints, 'mixed')()),
    categories: Array(numberOfPoints)
      .fill(null)
      .map(() => `CATEGORY_${parseInt((positiveRNG() * 10).toString(), 10).toString()}`),
    manyCategories: Array(numberOfPoints)
      .fill(null)
      .map(() => `MANY_CATEGORIES_${parseInt((positiveRNG() * 100).toString(), 10).toString()}`),
    twoCategories: Array(numberOfPoints)
      .fill(null)
      .map((_, i) => `${parseInt((RNG(i)() * numberOfPoints).toString(), 10) % 3 ? 'EVEN' : 'ODD'}_CATEGORY`),
    categoriesAsNumberOfPoints: Array(numberOfPoints)
      .fill(null)
      .map((_, i) => `DATA_CATEGORY_${i}`),
    singleCategory: Array(numberOfPoints)
      .fill(null)
      .map(() => `ONE_CATEGORY`),
  });

  const dataPromise = dataGetter();

  return [
    {
      info: {
        description: 'Positive numerical value of a data point',
        id: 'positiveNumbers',
        name: 'Positive numbers',
      },
      domain: [undefined, undefined],

      type: EColumnTypes.NUMERICAL,
      values: async () => {
        const data = await dataPromise;
        return data.positiveNumbers.map((val, i) => ({ id: i.toString(), val }));
      },
    },
    {
      info: {
        description: 'Negative numerical value of a data point',
        id: 'negativeNumbers',
        name: 'Negative numbers',
      },
      domain: [undefined, undefined],

      type: EColumnTypes.NUMERICAL,
      values: async () => {
        const data = await dataPromise;
        return data.negativeNumbers.map((val, i) => ({ id: i.toString(), val }));
      },
    },
    {
      info: {
        description: 'Random numbers generated for the data point. May be positive or negative or zero',
        id: 'randomNumbers',
        name: 'Random numbers',
      },
      type: EColumnTypes.NUMERICAL,
      domain: [undefined, undefined],
      values: async () => {
        const data = await dataPromise;
        return data.randomNumbers.map((val, i) => ({ id: i.toString(), val }));
      },
    },
    {
      info: {
        description: 'Single number value',
        id: 'singleNumber',
        name: 'Single number',
      },
      type: EColumnTypes.NUMERICAL,
      domain: [undefined, undefined],
      values: async () => {
        const data = await dataPromise;
        return data.singleNumber.map((val, i) => ({ id: i.toString(), val }));
      },
    },
    {
      info: {
        description: 'Categories for the data',
        id: 'categories',
        name: 'Categories',
      },
      type: EColumnTypes.CATEGORICAL,
      values: async () => {
        const data = await dataPromise;
        return data.categories.map((val, i) => ({ id: i.toString(), val }));
      },
    },
    {
      info: {
        description: 'Many categories for the data',
        id: 'manyCategories',
        name: 'Many categories',
      },
      type: EColumnTypes.CATEGORICAL,
      values: async () => {
        const data = await dataPromise;
        return data.manyCategories.map((val, i) => ({ id: i.toString(), val }));
      },
    },
    {
      info: {
        description: 'Two specific categories for the data',
        id: 'twoCategories',
        name: 'Two categories',
      },
      type: EColumnTypes.CATEGORICAL,
      values: async () => {
        const data = await dataPromise;
        return data.twoCategories.map((val, i) => ({ id: i.toString(), val }));
      },
    },
    {
      info: {
        description: 'Categories as much as the number of points',
        id: 'categoriesAsNumberOfPoints',
        name: 'Categories as number of points',
      },
      type: EColumnTypes.CATEGORICAL,
      values: async () => {
        const data = await dataPromise;
        return data.categoriesAsNumberOfPoints.map((val, i) => ({ id: i.toString(), val }));
      },
    },
    {
      info: {
        description: 'One category for the data',
        id: 'oneCategory',
        name: 'Single category',
      },
      type: EColumnTypes.CATEGORICAL,
      values: async () => {
        const data = await dataPromise;
        return data.singleCategory.map((val, i) => ({ id: i.toString(), val }));
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

export const Basic: typeof Template = Template.bind({}) as typeof Template;
Basic.args = {
  externalConfig: {
    type: ESupportedPlotlyVis.BAR,
    catColumnSelected: {
      description: 'Categories for the data',
      id: 'categories',
      name: 'Categories',
    },
    facets: null,
    group: null,
    groupType: EBarGroupingType.STACK,
    direction: EBarDirection.HORIZONTAL,
    display: EBarDisplayType.ABSOLUTE,
    aggregateType: EAggregateTypes.COUNT,
    aggregateColumn: null,
    numColumnsSelected: [],
    showSidebar: true,
  } as BaseVisConfig,
};

export const Vertical: typeof Template = Template.bind({}) as typeof Template;
Vertical.args = {
  externalConfig: {
    type: ESupportedPlotlyVis.BAR,
    catColumnSelected: {
      description: 'Categories for the data',
      id: 'categories',
      name: 'Categories',
    },
    facets: null,
    group: null,
    groupType: EBarGroupingType.GROUP,
    direction: EBarDirection.VERTICAL,
    display: EBarDisplayType.ABSOLUTE,
    aggregateType: EAggregateTypes.COUNT,
    aggregateColumn: null,
    numColumnsSelected: [],
    useFullHeight: false,
  } as BaseVisConfig,
};

export const VerticalFullHeight: typeof Template = Template.bind({}) as typeof Template;
VerticalFullHeight.args = {
  externalConfig: {
    type: ESupportedPlotlyVis.BAR,
    catColumnSelected: {
      description: 'Categories for the data',
      id: 'categories',
      name: 'Categories',
    },
    facets: null,
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
      description: 'Categories for the data',
      id: 'categories',
      name: 'Categories',
    },
    facets: null,
    group: {
      description: 'Many categories for the data',
      id: 'manyCategories',
      name: 'Many categories',
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
      description: 'Categories for the data',
      id: 'categories',
      name: 'Categories',
    },
    facets: null,
    group: {
      description: 'Many categories for the data',
      id: 'manyCategories',
      name: 'Many categories',
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
      description: 'Categories for the data',
      id: 'categories',
      name: 'Categories',
    },
    facets: null,
    group: {
      description: 'Positive numerical value of a data point',
      id: 'positiveNumbers',
      name: 'Positive numbers',
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
      description: 'Categories for the data',
      id: 'categories',
      name: 'Categories',
    },
    facets: null,
    group: {
      description: 'Positive numerical value of a data point',
      id: 'positiveNumbers',
      name: 'Positive numbers',
    },
    groupType: EBarGroupingType.STACK,
    direction: EBarDirection.HORIZONTAL,
    display: EBarDisplayType.ABSOLUTE,
    aggregateType: EAggregateTypes.COUNT,
    aggregateColumn: null,
    numColumnsSelected: [],
  } as BaseVisConfig,
};

export const GroupedNumericalStackNormalized: typeof Template = Template.bind({}) as typeof Template;
GroupedNumericalStackNormalized.args = {
  externalConfig: {
    type: ESupportedPlotlyVis.BAR,
    catColumnSelected: {
      description: 'Categories for the data',
      id: 'categories',
      name: 'Categories',
    },
    facets: null,
    group: {
      description: 'Positive numerical value of a data point',
      id: 'positiveNumbers',
      name: 'Positive numbers',
    },
    groupType: EBarGroupingType.STACK,
    direction: EBarDirection.HORIZONTAL,
    display: EBarDisplayType.NORMALIZED,
    aggregateType: EAggregateTypes.COUNT,
    aggregateColumn: null,
    numColumnsSelected: [],
  } as BaseVisConfig,
};

export const facets: typeof Template = Template.bind({}) as typeof Template;
facets.args = {
  externalConfig: {
    type: ESupportedPlotlyVis.BAR,
    catColumnSelected: {
      description: 'Categories for the data',
      id: 'categories',
      name: 'Categories',
    },
    facets: {
      description: 'Many categories for the data',
      id: 'manyCategories',
      name: 'Many categories',
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

export const facetsAndGrouped: typeof Template = Template.bind({}) as typeof Template;
facetsAndGrouped.args = {
  externalConfig: {
    type: ESupportedPlotlyVis.BAR,
    catColumnSelected: {
      description: 'Categories for the data',
      id: 'categories',
      name: 'Categories',
    },
    facets: {
      description: 'Many categories for the data',
      id: 'manyCategories',
      name: 'Many categories',
    },
    group: {
      description: 'Random numbers generated for the data point. May be positive or negative or zero',
      id: 'randomNumbers',
      name: 'Random numbers',
    },
    groupType: EBarGroupingType.GROUP,
    direction: EBarDirection.HORIZONTAL,
    display: EBarDisplayType.ABSOLUTE,
    aggregateType: EAggregateTypes.COUNT,
    aggregateColumn: null,
    numColumnsSelected: [],
  } as BaseVisConfig,
};

export const facetsAndGroupedStack: typeof Template = Template.bind({}) as typeof Template;
facetsAndGroupedStack.args = {
  externalConfig: {
    type: ESupportedPlotlyVis.BAR,
    catColumnSelected: {
      description: 'Categories for the data',
      id: 'categories',
      name: 'Categories',
    },
    facets: {
      description: 'Many categories for the data',
      id: 'manyCategories',
      name: 'Many categories',
    },
    group: {
      description: 'Random numbers generated for the data point. May be positive or negative or zero',
      id: 'randomNumbers',
      name: 'Random numbers',
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
      description: 'Categories for the data',
      id: 'categories',
      name: 'Categories',
    },
    facets: null,
    group: null,
    groupType: EBarGroupingType.GROUP,
    direction: EBarDirection.HORIZONTAL,
    display: EBarDisplayType.ABSOLUTE,
    aggregateType: EAggregateTypes.AVG,
    aggregateColumn: {
      description: 'Positive numerical value of a data point',
      id: 'positiveNumbers',
      name: 'Positive numbers',
    },
    numColumnsSelected: [],
  } as BaseVisConfig,
};

export const AggregateMedianWithMixedValues: typeof Template = Template.bind({}) as typeof Template;
AggregateMedianWithMixedValues.args = {
  externalConfig: {
    type: ESupportedPlotlyVis.BAR,
    catColumnSelected: {
      description: 'Categories for the data',
      id: 'categories',
      name: 'Categories',
    },
    facets: null,
    group: null,
    groupType: EBarGroupingType.GROUP,
    direction: EBarDirection.HORIZONTAL,
    display: EBarDisplayType.ABSOLUTE,
    aggregateType: EAggregateTypes.MED,
    aggregateColumn: {
      description: 'Random numbers generated for the data point. May be positive or negative or zero',
      id: 'randomNumbers',
      name: 'Random numbers',
    },
    numColumnsSelected: [],
  } as BaseVisConfig,
};

export const AggregateMedianWithGroupedMixedValues: typeof Template = Template.bind({}) as typeof Template;
AggregateMedianWithGroupedMixedValues.args = {
  externalConfig: {
    type: ESupportedPlotlyVis.BAR,
    catColumnSelected: {
      description: 'Categories for the data',
      id: 'categories',
      name: 'Categories',
    },
    facets: null,
    group: {
      description: 'Random numbers generated for the data point. May be positive or negative or zero',
      id: 'randomNumbers',
      name: 'Random numbers',
    },
    groupType: EBarGroupingType.GROUP,
    direction: EBarDirection.HORIZONTAL,
    display: EBarDisplayType.ABSOLUTE,
    aggregateType: EAggregateTypes.MED,
    aggregateColumn: {
      description: 'Random numbers generated for the data point. May be positive or negative or zero',
      id: 'randomNumbers',
      name: 'Random numbers',
    },
    numColumnsSelected: [],
  } as BaseVisConfig,
};

export const AggregateMedianWithGroupedAndFacetedMixedValues: typeof Template = Template.bind({}) as typeof Template;
AggregateMedianWithGroupedAndFacetedMixedValues.args = {
  externalConfig: {
    type: ESupportedPlotlyVis.BAR,
    catColumnSelected: {
      description: 'Categories for the data',
      id: 'categories',
      name: 'Categories',
    },
    facets: {
      description: 'Many categories for the data',
      id: 'manyCategories',
      name: 'Many categories',
    },
    group: {
      description: 'Random numbers generated for the data point. May be positive or negative or zero',
      id: 'randomNumbers',
      name: 'Random numbers',
    },
    groupType: EBarGroupingType.GROUP,
    direction: EBarDirection.HORIZONTAL,
    display: EBarDisplayType.ABSOLUTE,
    aggregateType: EAggregateTypes.MED,
    aggregateColumn: {
      description: 'Random numbers generated for the data point. May be positive or negative or zero',
      id: 'randomNumbers',
      name: 'Random numbers',
    },
    numColumnsSelected: [],
  } as BaseVisConfig,
};

export const PreconfiguredSorted: typeof Template = Template.bind({}) as typeof Template;
PreconfiguredSorted.args = {
  externalConfig: {
    type: ESupportedPlotlyVis.BAR,
    catColumnSelected: {
      description: 'Categories for the data',
      id: 'categories',
      name: 'Categories',
    },
    facets: null,
    group: {
      description: 'Two specific categories for the data',
      id: 'twoCategories',
      name: 'Two categories',
    },
    groupType: EBarGroupingType.STACK,
    direction: EBarDirection.HORIZONTAL,
    display: EBarDisplayType.ABSOLUTE,
    aggregateType: EAggregateTypes.COUNT,
    aggregateColumn: null,
    numColumnsSelected: [],
    sortState: { x: EBarSortState.DESCENDING, y: EBarSortState.NONE },
  } as BaseVisConfig,
};
