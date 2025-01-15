import { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { EBarDirection, EBarDisplayType, EBarGroupingType, EBarSortState } from '../../../bar/interfaces';
import { BaseVisConfig, EAggregateTypes, EColumnTypes, ESupportedPlotlyVis, VisCategoricalColumn, VisColumn } from '../../../interfaces';
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
    badNumbers: Array(numberOfPoints)
      .fill(null)
      .map(() => [null, undefined, Infinity, -Infinity, NaN][parseInt((positiveRNG() * numberOfPoints).toString(), 10) % 5]),
    categories: Array(numberOfPoints)
      .fill(null)
      .map(() => `CATEGORY_${parseInt((positiveRNG() * 10).toString(), 10).toString()}`),
    manyCategoriesWithBadValues: Array(numberOfPoints)
      .fill(null)
      .map((_, i) =>
        parseInt((RNG(i)() * numberOfPoints).toString(), 10) % 135
          ? `MANY_CATEGORIES_${parseInt((positiveRNG() * 150).toString(), 10).toString()}`
          : [null, undefined][parseInt((RNG(i)() * numberOfPoints).toString(), 10) % 2],
      ),
    twoCategories: Array(numberOfPoints)
      .fill(null)
      .map((_, i) => `${parseInt((RNG(i)() * numberOfPoints).toString(), 10) % 3 ? 'EVEN' : 'ODD'}_CATEGORY_WITH_LONG_LABELS_WHICH_SHOULD_BE_TRUNCATED`),
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
        description: 'Bad numbers like null, undefined, Infinity, -Infinity, NaN',
        id: 'badNumbers',
        name: 'Bad numbers',
      },
      type: EColumnTypes.NUMERICAL,
      domain: [undefined, undefined],
      values: async () => {
        const data = await dataPromise;
        return data.badNumbers.map((val, i) => ({ id: i.toString(), val }));
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
        description: 'Many categories for the data having some bad values',
        id: 'manyCategoriesWithBadValues',
        name: 'Many categories with bad values',
      },
      type: EColumnTypes.CATEGORICAL,
      values: async () => {
        const data = await dataPromise;
        return data.manyCategoriesWithBadValues.map((val, i) => ({ id: i.toString(), val }));
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
const meta: Meta<typeof Vis> = {
  title: 'Vis/vistypes/randomData/Bar',
  component: Vis,
  render: (args) => {
    // @ts-ignore TODO: The pointCount is an injected property, but we are using typeof Vis such that this prop does not exist.
    // eslint-disable-next-line react-hooks/rules-of-hooks
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
  },
  parameters: {
    argTypes: {
      pointCount: { control: 'number' },
    },
    args: {
      pointCount: 10000,
    },
  },
};

export default meta;
type Story = StoryObj<typeof Vis>;

export const Basic: Story = {
  args: {
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
      showColumnDescriptionText: true,
    } as BaseVisConfig,
  },
};

export const Vertical: Story = {
  args: {
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
  },
};

export const VerticalFullHeight: Story = {
  args: {
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
  },
};

export const Grouped: Story = {
  args: {
    externalConfig: {
      type: ESupportedPlotlyVis.BAR,
      catColumnSelected: {
        description: 'Categories for the data',
        id: 'categories',
        name: 'Categories',
      },
      facets: null,
      group: {
        description: 'Many categories for the data having some bad values',
        id: 'manyCategoriesWithBadValues',
        name: 'Many categories with bad values',
      },
      groupType: EBarGroupingType.GROUP,
      direction: EBarDirection.HORIZONTAL,
      display: EBarDisplayType.ABSOLUTE,
      aggregateType: EAggregateTypes.COUNT,
      aggregateColumn: null,
      numColumnsSelected: [],
    } as BaseVisConfig,
  },
};

export const GroupedStack: Story = {
  args: {
    externalConfig: {
      type: ESupportedPlotlyVis.BAR,
      catColumnSelected: {
        description: 'Categories for the data',
        id: 'categories',
        name: 'Categories',
      },
      facets: null,
      group: {
        description: 'Many categories for the data having some bad values',
        id: 'manyCategoriesWithBadValues',
        name: 'Many categories with bad values',
      },
      groupType: EBarGroupingType.STACK,
      direction: EBarDirection.HORIZONTAL,
      display: EBarDisplayType.ABSOLUTE,
      aggregateType: EAggregateTypes.COUNT,
      aggregateColumn: null,
      numColumnsSelected: [],
    } as BaseVisConfig,
  },
};

export const GroupedStackNormalized: Story = {
  args: {
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
      display: EBarDisplayType.NORMALIZED,
      aggregateType: EAggregateTypes.COUNT,
      aggregateColumn: null,
      numColumnsSelected: [],
    } as BaseVisConfig,
  },
};

export const GroupedNumerical: Story = {
  args: {
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
  },
};

export const GroupedNumericalStack: Story = {
  args: {
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
  },
};

export const GroupedNumericalStackNormalized: Story = {
  args: {
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
  },
};

export const facets: Story = {
  args: {
    externalConfig: {
      type: ESupportedPlotlyVis.BAR,
      catColumnSelected: {
        description: 'Categories for the data',
        id: 'categories',
        name: 'Categories',
      },
      facets: {
        description: 'Many categories for the data having some bad values',
        id: 'manyCategoriesWithBadValues',
        name: 'Many categories with bad values',
      },
      group: null,
      groupType: EBarGroupingType.GROUP,
      direction: EBarDirection.HORIZONTAL,
      display: EBarDisplayType.ABSOLUTE,
      aggregateType: EAggregateTypes.COUNT,
      aggregateColumn: null,
      numColumnsSelected: [],
    } as BaseVisConfig,
  },
};

export const facetsAndGrouped: Story = {
  args: {
    externalConfig: {
      type: ESupportedPlotlyVis.BAR,
      catColumnSelected: {
        description: 'Categories for the data',
        id: 'categories',
        name: 'Categories',
      },
      facets: {
        description: 'Many categories for the data having some bad values',
        id: 'manyCategoriesWithBadValues',
        name: 'Many categories with bad values',
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
  },
};

export const facetsAndGroupedStack: Story = {
  args: {
    externalConfig: {
      type: ESupportedPlotlyVis.BAR,
      catColumnSelected: {
        description: 'Categories for the data',
        id: 'categories',
        name: 'Categories',
      },
      facets: {
        description: 'Many categories for the data having some bad values',
        id: 'manyCategoriesWithBadValues',
        name: 'Many categories with bad values',
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
  },
};

export const AggregateAverage: Story = {
  args: {
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
  },
};

export const AggregateMedianWithMixedValues: Story = {
  args: {
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
  },
};

export const AggregateMedianWithGroupedMixedValues: Story = {
  args: {
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
  },
};

export const AggregateMedianWithGroupedAndFacetedMixedValues: Story = {
  args: {
    externalConfig: {
      type: ESupportedPlotlyVis.BAR,
      catColumnSelected: {
        description: 'Categories for the data',
        id: 'categories',
        name: 'Categories',
      },
      facets: {
        description: 'Many categories for the data having some bad values',
        id: 'manyCategoriesWithBadValues',
        name: 'Many categories with bad values',
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
  },
};

export const PreconfiguredSorted: Story = {
  args: {
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
  },
};
