import * as React from 'react';

import { Group, Slider, Switch, Text } from '@mantine/core';
import * as d3 from 'd3v7';
import { map, uniq } from 'lodash';
import * as vsup from 'vsup';

import { FlameTree } from '../FlameTree';
import { AggregateSelect } from '../FlameTree/AggregateSelect';
import { CutoffSlider } from '../FlameTree/CutoffSlider';
import { useCutoffFilter, useStateReset } from '../FlameTree/hooks';
import { AggregationType, ParameterColumn, adjustDomain, aggregateBy, createParameterHierarchy } from '../FlameTree/math';

const { UseCase2 } = await import('./case_study_2');

export default function FlameCase2() {
  const [aggregation, setAggregation] = React.useState<AggregationType>('max');
  const [uncertaintyAggregation, setUncertaintyAggregation] = React.useState<AggregationType>('min');
  const [iteration, setIteration] = React.useState<number>(0);
  const [synchronizeHover, setSynchronizeHover] = React.useState<boolean>(false);

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
      return {
        value: aggregateBy(aggregation, map(items, `pred_yield_mean_${iteration}`) as number[]),
        uncertainty: aggregateBy(uncertaintyAggregation, map(items, `pred_yield_var_${iteration}`) as number[]),
      };
    });
  }, [aggregation, uncertaintyAggregation, definitions, iteration, layering]);

  const experiments = React.useMemo(() => {
    return UseCase2.filter((entry) => entry.meas_yield !== -1);
  }, []);

  const scales = React.useMemo(() => {
    const binDomain = d3.extent(Object.values(bins).map((bin) => bin.value.value as number)) as number[];
    const dataDomain = d3.extent(UseCase2.map((entry) => entry.meas_yield)) as number[];
    const binVariance = d3.extent(Object.values(bins).map((bin) => bin.value.uncertainty as number)) as number[];

    const yieldDomain = d3.extent([...binDomain, ...dataDomain]) as number[];

    const squareQuantization = vsup.squareQuantization().n(10).valueDomain(yieldDomain).uncertaintyDomain(binVariance);
    const squareScale = vsup.scale().quantize(squareQuantization).range(d3.interpolateCividis);

    const heatLegend = vsup.legend.heatmapLegend().scale(squareScale).size(150).x(60).y(160);

    return {
      squareScale,
      heatLegend,
      cutoffDomain: adjustDomain(binDomain),
    };
  }, [bins]);

  const [cutoff, setCutoff] = React.useState<number>(scales.cutoffDomain[0]!);

  useStateReset(() => {
    setCutoff(scales.cutoffDomain[0]!);
  }, scales);

  const filter = useCutoffFilter(bins, 'value', cutoff);

  React.useEffect(() => {
    // Add legend to svg
    // d3.select('#mylegend').selectAll('> *').remove();
    // const svg = d3.select('#mylegend').append('g').call(scales.heatLegend);
  }, [scales]);

  return (
    <div>
      <FlameTree
        bins={bins}
        definitions={definitions}
        layering={layering}
        setLayering={setLayering}
        experiments={experiments}
        synchronizeHover={synchronizeHover}
        filter={filter}
        colorScale={(item) => {
          return scales.squareScale(item.value as number, item.uncertainty as number);
        }}
        experimentsColorScale={(item) => {
          return scales.squareScale(item.meas_yield, 0);
        }}
      >
        <FlameTree.Toolbar>
          <Group align="flex-end" gap="xl">
            <AggregateSelect label="Value aggregation" aggregation={aggregation} setAggregation={setAggregation} />
            <AggregateSelect label="Uncertainty aggregation" aggregation={uncertaintyAggregation} setAggregation={setUncertaintyAggregation} />

            <Switch
              label="Synchronize hover"
              mb={8}
              checked={synchronizeHover}
              onChange={(event) => {
                setSynchronizeHover(event.currentTarget.checked);
              }}
            />

            <Group mb={8}>
              <Text size="sm">Iteration</Text>
              <Slider value={iteration} onChange={setIteration} min={0} max={7} w={200} />
            </Group>

            <CutoffSlider mb={8} domain={scales.cutoffDomain} value={cutoff} onChange={setCutoff} />
          </Group>
        </FlameTree.Toolbar>
      </FlameTree>
    </div>
  );
}
