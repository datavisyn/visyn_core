import { ComponentStory } from '@storybook/react';
import React from 'react';
import { EBarDirection, EBarDisplayType, EBarGroupingType } from '../../../bar/interfaces';
import { BaseVisConfig, EAggregateTypes, EColumnTypes, ESupportedPlotlyVis, VisColumn } from '../../../interfaces';
import { Vis } from '../../../LazyVis';
import { VisProvider } from '../../../Provider';
import { fetchTestData, generateTestData } from '../../explodedData';

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
  const rng = RNG(10, 'mixed');
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
        description: 'PCA_X value',
        id: 'pca_x',
        name: 'PCA_X',
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
        description: 'PCA_Y value of the data point',
        id: 'pca_y',
        name: 'PCA_Y',
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
        description: 'Numerical value of the data point with a long description that should be truncated in the UI',
        id: 'value',
        name: 'Value',
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
        description: 'Description for category',
        id: 'category',
        name: 'Category',
      },
      type: EColumnTypes.CATEGORICAL,
      values: async () => {
        const data = await dataPromise;
        return data.category.map((val, i) => ({ id: i.toString(), val }));
      },
    },
    {
      info: {
        description: 'Category 2 description',
        id: 'category2',
        name: 'Category 2',
      },
      type: EColumnTypes.CATEGORICAL,
      values: async () => {
        const data = await dataPromise;
        return data.category2.map((val, i) => ({ id: i.toString(), val }));
      },
    },
    {
      info: {
        description: 'Category 3 with a long description that should be truncated in the UI',
        id: 'category3',
        name: 'Category 3',
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
  // const columns = React.useMemo(() => fetchData(args.pointCount), [args.pointCount]);
  const testData = generateTestData(200);
  const columns = React.useMemo(() => fetchTestData(testData), [testData]);

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
      name: 'Name of the patient',
      id: 'name',
      description: 'The name of the patient',
    },
    facets: null,
    group: null,
    groupType: EBarGroupingType.GROUP,
    direction: EBarDirection.HORIZONTAL,
    display: EBarDisplayType.ABSOLUTE,
    aggregateType: EAggregateTypes.COUNT,
    aggregateColumn: null,
    numColumnsSelected: [],
  } as BaseVisConfig,
};

export const Vertical: typeof Template = Template.bind({}) as typeof Template;
Vertical.args = {
  externalConfig: {
    type: ESupportedPlotlyVis.BAR,
    catColumnSelected: {
      name: 'Name of the patient',
      id: 'name',
      description: 'The name of the patient',
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
      name: 'Name of the patient',
      id: 'name',
      description: 'The name of the patient',
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
      name: 'Name of the patient',
      id: 'name',
      description: 'The name of the patient',
    },
    facets: null,
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
      name: 'Name of the patient',
      id: 'name',
      description: 'The name of the patient',
    },
    facets: null,
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
      name: 'Name of the patient',
      id: 'name',
      description: 'The name of the patient',
    },
    facets: null,
    group: {
      name: 'Numerical 1',
      id: 'numerical1',
      description: 'The first numerical value',
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
      name: 'Name of the patient',
      id: 'name',
      description: 'The name of the patient',
    },
    facets: null,
    group: {
      name: 'Numerical 1',
      id: 'numerical1',
      description: 'The first numerical value',
    },
    groupType: EBarGroupingType.STACK,
    direction: EBarDirection.HORIZONTAL,
    display: EBarDisplayType.ABSOLUTE,
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
      name: 'Name of the patient',
      id: 'name',
      description: 'The name of the patient',
    },
    facets: {
      name: 'Type 1',
      id: 'type1',
      description: 'The first type value',
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
      name: 'Name of the patient',
      id: 'name',
      description: 'The name of the patient',
    },
    facets: {
      name: 'Type 1',
      id: 'type1',
      description: 'The first type value',
    },
    group: {
      name: 'Numerical 1',
      id: 'numerical1',
      description: 'The first numerical value',
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
      name: 'Name of the patient',
      id: 'name',
      description: 'The name of the patient',
    },
    facets: {
      name: 'Type 1',
      id: 'type1',
      description: 'The first type value',
    },
    group: {
      name: 'Numerical 1',
      id: 'numerical1',
      description: 'The first numerical value',
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
      name: 'Name of the patient',
      id: 'name',
      description: 'The name of the patient',
    },
    facets: null,
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
