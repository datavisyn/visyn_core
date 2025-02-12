import React from 'react';

import { Button, Group, Select, Slider, Switch, Text } from '@mantine/core';
import * as d3 from 'd3v7';
import { map, uniq } from 'lodash';
import * as vsup from 'vsup';

import { FlameTree, FlameTreeAPI } from '../FlameTree';
import { HeatmapLegend } from './HeatmapLegend';
import { AggregateSelect } from '../FlameTree/AggregateSelect';
import { CutoffSlider } from '../FlameTree/CutoffSlider';
import { useCutoffFilter, useStateReset } from '../FlameTree/hooks';
import { AggregationType, ParameterColumn, adjustDomain, aggregateBy, createParameterHierarchy } from '../FlameTree/math';

export default function CimeFlameTree({
  dataset,
  definitions,
  mode,
  maxIterations,
}: {
  dataset: Record<string, unknown>[];
  definitions: ParameterColumn[];
  mode: 'experiment' | 'prediction';
  maxIterations?: number;
}) {
  const dataKey = mode === 'experiment' ? 'measured_yield' : 'meas_yield';

  const [iteration, setIteration] = React.useState<number>(0);
  const [layering, setLayering] = React.useState<string[]>(definitions.map((column) => column.key));
  const [aggregation, setAggregation] = React.useState<AggregationType>('max');
  const [uncertaintyAggregation, setUncertaintyAggregation] = React.useState<AggregationType>('min');
  const [coloring, setColoring] = React.useState<'yield' | 'yield+uncertainty'>('yield+uncertainty');

  const bins = React.useMemo(() => {
    return createParameterHierarchy(definitions, dataset, layering, [0, 100], (items) => {
      return {
        value:
          mode === 'experiment'
            ? aggregateBy(aggregation, map(items, dataKey) as number[])
            : aggregateBy(aggregation, map(items, `pred_yield_mean_${iteration}`) as number[]),
        uncertainty: mode === 'experiment' ? 0 : aggregateBy(uncertaintyAggregation, map(items, `pred_yield_var_${iteration}`) as number[]),
      };
    });
  }, [aggregation, dataKey, dataset, definitions, iteration, layering, mode, uncertaintyAggregation]);

  const experiments = React.useMemo(() => {
    return dataset.filter((entry) => (entry.experiment_cycle as number) <= iteration && entry[dataKey] !== -1);
  }, [dataKey, dataset, iteration]);

  const scales = React.useMemo(() => {
    const binDomain = d3.extent(Object.values(bins).map((bin) => bin.value.value as number)) as number[];
    const binVariance = d3.extent(Object.values(bins).map((bin) => bin.value.uncertainty as number)) as number[];
    const dataDomain = d3.extent(dataset.map((entry) => entry[dataKey] as number)) as number[];
    const yieldDomain = d3.extent([...binDomain, ...dataDomain]) as number[];

    const squareQuantization = vsup
      .squareQuantization()
      .n(5)
      .valueDomain(yieldDomain)
      .uncertaintyDomain(mode === 'experiment' ? [0, 1] : binVariance);

    const squareScale = vsup.scale().quantize(squareQuantization).range(d3.interpolateCividis);

    return {
      squareScale,
      cutoffDomain: adjustDomain(binDomain),
    };
  }, [bins, dataKey, dataset, mode]);

  // @TODO comment in to verify custom scale against this one
  /* React.useEffect(() => {
    d3.select('#legend').selectAll('*').remove();
    d3.select('#legend').append('g').call(scales.heatLegend);
  }, [scales, scales.heatLegend]); */

  const [cutoff, setCutoff] = React.useState<number>(scales.cutoffDomain[0]!);

  useStateReset(() => {
    setCutoff(scales.cutoffDomain[0]!);
  }, scales);

  const filter = useCutoffFilter(bins, 'value', cutoff);

  const [synchronizeHover, setSynchronizeHover] = React.useState<boolean>(true);

  const apiRef = React.useRef<FlameTreeAPI>();

  const colorScale = React.useMemo(() => {
    return (item: { value: number; uncertainty: number }) => {
      if (coloring === 'yield') {
        return scales.squareScale(item.value as number, 0);
      }

      if (coloring === 'yield+uncertainty') {
        return scales.squareScale(item.value as number, item.uncertainty as number);
      }

      return 'black';
    };
  }, [coloring, scales]);

  const experimentsColorScale = React.useMemo(() => {
    return (item: Record<string, unknown>) => {
      return mode === 'experiment' ? scales.squareScale(item[dataKey] as number, 0) : scales.squareScale(item[dataKey] as number, 0);
    };
  }, [dataKey, mode, scales]);

  return (
    <div>
      <HeatmapLegend n={5} scale={scales.squareScale} />

      <FlameTree
        bins={bins}
        definitions={definitions}
        layering={layering}
        setLayering={setLayering}
        experiments={experiments}
        filter={filter}
        itemHeight={90}
        apiRef={apiRef}
        synchronizeHover={synchronizeHover}
        colorScale={colorScale}
        experimentsColorScale={experimentsColorScale}
      >
        <FlameTree.Toolbar>
          <Group align="flex-end" gap="xl">
            <Select
              label="Coloring"
              value={coloring}
              onChange={setColoring as (v: string | null) => void}
              data={[
                {
                  label: 'Yield',
                  value: 'yield',
                },
                {
                  label: 'Yield + Uncertainty',
                  value: 'yield+uncertainty',
                },
              ]}
            />

            <AggregateSelect label="Value aggregation" aggregation={aggregation} setAggregation={setAggregation} />
            {mode === 'prediction' ? (
              <AggregateSelect label="Uncertainty aggregation" aggregation={uncertaintyAggregation} setAggregation={setUncertaintyAggregation} />
            ) : null}

            {mode === 'prediction' ? (
              <Group mb={8}>
                <Text size="sm">Iteration</Text>
                <Slider value={iteration} onChange={setIteration} min={0} max={maxIterations} w={200} />
              </Group>
            ) : null}

            <Switch
              label="Synchronize hover"
              mb={8}
              checked={synchronizeHover}
              onChange={(event) => {
                setSynchronizeHover(event.currentTarget.checked);
              }}
            />

            <CutoffSlider mb={8} domain={scales.cutoffDomain} value={cutoff} onChange={setCutoff} />

            <Button
              onClick={() => {
                apiRef.current?.resetZoom();
              }}
            >
              Reset zoom
            </Button>
          </Group>
        </FlameTree.Toolbar>
      </FlameTree>
    </div>
  );
}
