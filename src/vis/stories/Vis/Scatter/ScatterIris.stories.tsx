import { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Vis } from '../../../LazyVis';
import { VisProvider } from '../../../Provider';
import { BaseVisConfig, ENumericalColorScaleType, EScatterSelectSettings, ESupportedPlotlyVis } from '../../../interfaces';
import { ELabelingOptions, ERegressionLineType, IScatterConfig } from '../../../scatter/interfaces';
import { fetchIrisData } from '../../fetchIrisData';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof Vis> = {
  title: 'Vis/Scatter',
  component: Vis,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  render: (args) => {
    const columns = React.useMemo(() => fetchIrisData(), []);

    const [selection, setSelection] = useState<string[]>([]);
    return (
      <VisProvider>
        <div style={{ height: '100vh', width: '100%', display: 'flex', justifyContent: 'center', alignContent: 'center', flexWrap: 'wrap' }}>
          <div style={{ width: '70%', height: '80%' }}>
            <Vis {...args} selected={selection} selectionCallback={setSelection} columns={columns} />
          </div>
        </div>
      </VisProvider>
    );
  },
};

export default meta;
type Story = StoryObj<typeof Vis>;

// More on args: https://storybook.js.org/docs/react/writing-stories/args

export const Basic: Story = {
  args: {
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
      xAxisScale: 'log',
      yAxisScale: 'log',
      color: null,
      facets: null,
      numColorScaleType: ENumericalColorScaleType.SEQUENTIAL,
      shape: null,
      dragMode: EScatterSelectSettings.RECTANGLE,
      alphaSliderVal: 1,
      showLabels: ELabelingOptions.NEVER,
      regressionLineOptions: {
        type: ERegressionLineType.NONE,
      },
    } as IScatterConfig,

    filterCallback: (option) => {
      console.log({ option });
    },
  },
};

export const ControlledSubplots: Story = {
  args: {
    externalConfig: {
      type: ESupportedPlotlyVis.SCATTER,
      color: null,
      subplots: [
        {
          xColumn: {
            description: '',
            id: 'petalLength',
            name: 'Petal Length',
          },
          yColumn: {
            description: '',
            id: 'petalWidth',
            name: 'Petal Width',
          },
          title: 'Nicer Title',
        },
        {
          yColumn: {
            description: '',
            id: 'petalLength',
            name: 'Petal Length',
          },
          xColumn: {
            description: '',
            id: 'petalWidth',
            name: 'Petal Width',
          },
          title: 'Petal Length vs Petal Width',
        },
        {
          yColumn: {
            description: '',
            id: 'petalLength',
            name: 'Petal Length',
          },
          xColumn: {
            description: '',
            id: 'petalWidth',
            name: 'Petal Width',
          },
          title: 'Petal Length vs Petal Width',
        },
        {
          yColumn: {
            description: '',
            id: 'petalLength',
            name: 'Petal Length',
          },
          xColumn: {
            description: '',
            id: 'petalWidth',
            name: 'Petal Width',
          },
          title: 'Petal Length vs Petal Width',
        },
        {
          yColumn: {
            description: '',
            id: 'petalLength',
            name: 'Petal Length',
          },
          xColumn: {
            description: '',
            id: 'petalWidth',
            name: 'Petal Width',
          },
          title: 'Petal Length vs Petal Width',
        },
        {
          xColumn: {
            description: '',
            id: 'petalLength',
            name: 'Petal Length',
          },
          yColumn: {
            description: '',
            id: 'petalWidth',
            name: 'Petal Width',
          },
          title: 'Petal Length vs Petal Width',
        },
      ],
      xAxisScale: 'log',
      yAxisScale: 'log',
      facets: null,
      numColorScaleType: ENumericalColorScaleType.SEQUENTIAL,
      shape: null,
      dragMode: EScatterSelectSettings.RECTANGLE,
      alphaSliderVal: 1,
      showLabels: ELabelingOptions.NEVER,
      regressionLineOptions: {
        type: ERegressionLineType.NONE,
      },
    } as IScatterConfig,

    filterCallback: (option) => {
      console.log({ option });
    },
  },
};

export const ControlledSingleSubplot: Story = {
  args: {
    externalConfig: {
      type: ESupportedPlotlyVis.SCATTER,
      color: null,
      subplots: [
        {
          xColumn: {
            description: '',
            id: 'incompleteX',
            name: 'Incomplete X',
          },
          yColumn: {
            description: '',
            id: 'incompleteY',
            name: 'Incomplete Y',
          },
          title: 'Nicer Title',
        },
      ],
      xAxisScale: 'log',
      yAxisScale: 'log',
      facets: null,
      numColorScaleType: ENumericalColorScaleType.SEQUENTIAL,
      shape: null,
      dragMode: EScatterSelectSettings.RECTANGLE,
      alphaSliderVal: 1,
      showLabels: ELabelingOptions.NEVER,
      regressionLineOptions: {
        type: ERegressionLineType.NONE,
      },
    } as IScatterConfig,
    filterCallback: (option) => {
      console.log({ option });
    },
  },
};

export const ColorByCategory: Story = {
  args: {
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
      alphaSliderVal: 0.5,
      showLabels: ELabelingOptions.NEVER,
      regressionLineOptions: {
        type: ERegressionLineType.NONE,
      },
    } as BaseVisConfig,
  },
};

export const ColorByNumerical: Story = {
  args: {
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
        id: 'petalLength',
        name: 'Petal Length',
      },
      numColorScaleType: ENumericalColorScaleType.SEQUENTIAL,
      shape: null,
      dragMode: EScatterSelectSettings.RECTANGLE,
      alphaSliderVal: 0.5,
      showLabels: ELabelingOptions.NEVER,
      regressionLineOptions: {
        type: ERegressionLineType.NONE,
      },
    } as BaseVisConfig,
  },
};

export const SmallMultiples: Story = {
  args: {
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
        {
          description: '',
          id: 'petalLength',
          name: 'Petal Length',
        },
      ],
      color: null,
      numColorScaleType: ENumericalColorScaleType.SEQUENTIAL,
      shape: null,
      dragMode: EScatterSelectSettings.RECTANGLE,
      alphaSliderVal: 0.5,
      showLabels: ELabelingOptions.NEVER,
      regressionLineOptions: {
        type: ERegressionLineType.NONE,
      },
    } as BaseVisConfig,
  },
};

export const LinearRegression: Story = {
  args: {
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
          id: 'petalLength',
          name: 'Petal length',
        },
      ],
      color: {
        description: '',
        id: 'petalLength',
        name: 'Petal Length',
      },
      shape: null,
      dragMode: EScatterSelectSettings.RECTANGLE,
      alphaSliderVal: 0.3,
      showLabels: ELabelingOptions.NEVER,
      regressionLineOptions: {
        type: ERegressionLineType.POLYNOMIAL,
        showStats: true,
      },
    } as IScatterConfig,
  },
};
