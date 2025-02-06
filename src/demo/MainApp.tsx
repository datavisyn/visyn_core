import * as React from 'react';

import { Select, Slider, Tabs, Text } from '@mantine/core';
import * as d3 from 'd3v7';
import map from 'lodash/map';
import max from 'lodash/max';
import mean from 'lodash/mean';
import min from 'lodash/min';
import sortBy from 'lodash/sortBy';
import uniq from 'lodash/uniq';
import * as vsup from 'vsup';

import { VisynApp, VisynHeader } from '../app';
import { FlameTree } from './FlameTree';
import { ParameterColumn, createParameterHierarchy } from './FlameTree/math';

const { UseCase1 } = await import('./FlameTree/case_study_1');
const { UseCase2 } = await import('./FlameTree/case_study_2');

// TODO: React lazy and suspense to only load active tab
function FlameCase1() {
  const [aggregation, setAggregation] = React.useState<string | null>('max');

  const definitions = React.useMemo(() => {
    const ArylColumn: ParameterColumn = {
      key: 'aryl_halide_file_name_exp_param',
      domain: uniq(map(UseCase1, 'aryl_halide_file_name_exp_param')),
      type: 'categorical',
    };

    const AdditiveColumn: ParameterColumn = {
      key: 'additive_file_name_exp_param',
      domain: uniq(map(UseCase1, 'additive_file_name_exp_param')),
      type: 'categorical',
    };

    const LigandColumn: ParameterColumn = {
      key: 'ligand_file_name_exp_param',
      domain: uniq(map(UseCase1, 'ligand_file_name_exp_param')),
      type: 'categorical',
    };

    const BaseColumn: ParameterColumn = {
      key: 'base_file_name_exp_param',
      domain: uniq(map(UseCase1, 'base_file_name_exp_param')),
      type: 'categorical',
    };

    return [ArylColumn, BaseColumn, LigandColumn, AdditiveColumn];
  }, []);

  const [layering, setLayering] = React.useState<string[]>(definitions.map((column) => column.key));

  const bins = React.useMemo(() => {
    return createParameterHierarchy(definitions, UseCase1, layering, [0, 100], (items) => {
      const values = map(items, 'measured_yield') as number[];
      let value = 0;

      switch (aggregation) {
        case 'min':
          value = min(values) ?? 0;
          break;
        case 'max':
          value = max(values) ?? 0;
          break;
        case 'mean':
          value = mean(values) ?? 0;
          break;
        case 'median': {
          const sorted = sortBy(values);
          value = sorted[Math.floor(sorted.length / 2)] ?? 0;
          break;
        }
        default:
          throw new Error('Unknown aggregation');
      }

      return {
        value,
        uncertainty: 0,
      };
    });
  }, [aggregation, definitions, layering]);

  const scales = React.useMemo(() => {
    const binDomain = d3.extent(Object.values(bins).map((bin) => bin.value.value as number)) as number[];

    const squareQuantization = vsup.squareQuantization().n(10).valueDomain(binDomain).uncertaintyDomain([0, 1]);
    const squareScale = vsup.scale().quantize(squareQuantization).range(d3.interpolateCividis);

    const heatLegend = vsup.legend.heatmapLegend().scale(squareScale).size(150).x(60).y(160);

    // Add legend to svg
    const svg = d3.select('#mylegend').append('g').call(heatLegend);

    return {
      squareQuantization,
      squareScale,
      heatLegend,
      binDomain,
    };
  }, [bins]);

  return (
    <div>
      <Select
        ml="xs"
        w={300}
        label="Aggregate using"
        value={aggregation}
        onChange={setAggregation}
        data={[
          {
            label: 'Minimum',
            value: 'min',
          },
          {
            label: 'Maximum',
            value: 'max',
          },
          {
            label: 'Mean',
            value: 'mean',
          },
          {
            label: 'Median',
            value: 'median',
          },
        ]}
      />
      <FlameTree
        bins={bins}
        definitions={definitions}
        layering={layering}
        setLayering={setLayering}
        experiments={UseCase1}
        colorScale={(item) => {
          return scales.squareScale(item.value as number, item.uncertainty as number);
        }}
        experimentsColorScale={(item) => {
          return scales.squareScale(item.measured_yield, 0);
        }}
      />
    </div>
  );
}

function FlameCase2() {
  const [aggregation, setAggregation] = React.useState<string | null>('max');
  const [iteration, setIteration] = React.useState<number>(0);

  const definitions = React.useMemo(() => {
    const LigandColumn: ParameterColumn = {
      key: 'ligand_file_name_exp_param',
      domain: uniq(map(UseCase2, 'ligand_file_name_exp_param')),
      type: 'categorical',
    };

    const BaseColumn: ParameterColumn = {
      key: 'base_file_name_exp_param',
      domain: uniq(map(UseCase2, 'base_file_name_exp_param')),
      type: 'categorical',
    };

    const TemperatureColumn: ParameterColumn = {
      key: 'temperature_exp_param',
      domain: uniq(map(UseCase2, 'temperature_exp_param')),
      type: 'categorical',
    };

    const ConcentrationColumn: ParameterColumn = {
      key: 'concentration_exp_param',
      domain: uniq(map(UseCase2, 'concentration_exp_param')),
      type: 'categorical',
    };

    const SolvenColumn: ParameterColumn = {
      key: 'solvent_file_name_exp_param',
      domain: uniq(map(UseCase2, 'solvent_file_name_exp_param')),
      type: 'categorical',
    };

    return [LigandColumn, BaseColumn, TemperatureColumn, ConcentrationColumn, SolvenColumn];
  }, []);

  const [layering, setLayering] = React.useState<string[]>(definitions.map((column) => column.key));

  const bins = React.useMemo(() => {
    return createParameterHierarchy(definitions, UseCase2, layering, [0, 100], (items) => {
      const values = map(items, `pred_yield_mean_${iteration}`) as number[];
      const varianceValues = map(items, `pred_yield_var_${iteration}`) as number[];
      let value = 0;
      let uncertainty = 0;

      switch (aggregation) {
        case 'min':
          value = min(values) ?? 0;
          uncertainty = min(varianceValues) ?? 0;
          break;
        case 'max':
          value = max(values) ?? 0;
          uncertainty = max(varianceValues) ?? 0;
          break;
        case 'mean':
          value = mean(values) ?? 0;
          uncertainty = mean(varianceValues) ?? 0;
          break;
        case 'median': {
          const sorted = sortBy(values);
          value = sorted[Math.floor(sorted.length / 2)] ?? 0;
          break;
        }
        default:
          throw new Error('Unknown aggregation');
      }

      return {
        value,
        uncertainty,
      };
    });
  }, [aggregation, definitions, iteration, layering]);

  const experiments = React.useMemo(() => {
    return UseCase2.filter((entry) => entry.meas_yield !== -1);
  }, []);

  const scales = React.useMemo(() => {
    const binDomain = d3.extent(Object.values(bins).map((bin) => bin.value.value as number)) as number[];
    const binVariance = d3.extent(Object.values(bins).map((bin) => bin.value.uncertainty as number)) as number[];

    const squareQuantization = vsup.squareQuantization().n(10).valueDomain(binDomain).uncertaintyDomain(binVariance);
    const squareScale = vsup.scale().quantize(squareQuantization).range(d3.interpolateCividis);

    const heatLegend = vsup.legend.heatmapLegend().scale(squareScale).size(150).x(60).y(160);

    // Add legend to svg
    // d3.select('#mylegend').selectAll('> *').remove();
    const svg = d3.select('#mylegend').append('g').call(heatLegend);

    return {
      squareQuantization,
      squareScale,
      heatLegend,
      binDomain,
    };
  }, [bins]);

  return (
    <div>
      <Select
        ml="xs"
        w={300}
        label="Aggregate using"
        value={aggregation}
        onChange={setAggregation}
        data={[
          {
            label: 'Minimum',
            value: 'min',
          },
          {
            label: 'Maximum',
            value: 'max',
          },
          {
            label: 'Mean',
            value: 'mean',
          },
          {
            label: 'Median',
            value: 'median',
          },
        ]}
      />
      <Slider value={iteration} onChange={setIteration} min={0} max={7} w={300} />
      <FlameTree
        bins={bins}
        definitions={definitions}
        layering={layering}
        setLayering={setLayering}
        experiments={experiments}
        colorScale={(item) => {
          return scales.squareScale(item.value as number, item.uncertainty as number);
        }}
        experimentsColorScale={(item) => {
          return scales.squareScale(item.meas_yield, 0);
        }}
      />
    </div>
  );
}

export function MainApp() {
  return (
    <VisynApp
      header={
        <VisynHeader
          components={{
            aboutAppModal: {
              content: <Text>This is the demo app for visyn core.</Text>,
            },
            center: (
              <Text c="white" size="sm">
                Waffle Plot Demo
              </Text>
            ),
          }}
        />
      }
    >
      <Tabs defaultValue="gallery" keepMounted={false} variant="pills">
        <Tabs.List>
          <Tabs.Tab value="gallery">Case Study 1</Tabs.Tab>
          <Tabs.Tab value="messages">Case Study 2</Tabs.Tab>
          <Tabs.Tab value="settings">Case Study 3</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="gallery">
          <FlameCase1 />
        </Tabs.Panel>

        <Tabs.Panel value="messages">
          <FlameCase2 />
        </Tabs.Panel>

        <Tabs.Panel value="settings">Settings tab content</Tabs.Panel>
      </Tabs>
    </VisynApp>
  );
}
