import React from 'react';

import { css } from '@emotion/css';
import { Group, Switch, Text } from '@mantine/core';
import * as d3 from 'd3v7';
import { map, uniq } from 'lodash';
import * as vsup from 'vsup';

import { FlameTree } from '../FlameTree';
import { AggregateSelect } from '../FlameTree/AggregateSelect';
import { CutoffSlider } from '../FlameTree/CutoffSlider';
import { useCutoffFilter, useStateReset } from '../FlameTree/hooks';
import { AggregationType, ParameterColumn, adjustDomain, aggregateBy, createParameterHierarchy } from '../FlameTree/math';
import { TooltipContent, TooltipContentBin } from '../FlameTree/TooltipContent';

const { UseCase1 } = await import('./case_study_1');

export default function FlameCase1() {
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
  const [aggregation, setAggregation] = React.useState<AggregationType>('max');

  const bins = React.useMemo(() => {
    return createParameterHierarchy(definitions, UseCase1, layering, [0, 100], (items) => {
      return {
        value: aggregateBy(aggregation, map(items, 'measured_yield') as number[]),
        uncertainty: 0,
      };
    });
  }, [aggregation, definitions, layering]);

  const scales = React.useMemo(() => {
    const binDomain = d3.extent(Object.values(bins).map((bin) => bin.value.value as number)) as number[];

    const squareQuantization = vsup.squareQuantization().n(5).valueDomain(binDomain).uncertaintyDomain([0, 1]);
    const squareScale = vsup.scale().quantize(squareQuantization).range(d3.interpolateCividis);

    const heatLegend = vsup.legend.heatmapLegend().scale(squareScale).size(150).x(10).y(20);

    return {
      squareQuantization,
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

  const [synchronizeHover, setSynchronizeHover] = React.useState<boolean>(true);

  return (
    <div>
      <FlameTree
        bins={bins}
        definitions={definitions}
        layering={layering}
        setLayering={setLayering}
        experiments={UseCase1}
        filter={filter}
        itemHeight={90}
        synchronizeHover={synchronizeHover}
        colorScale={(item) => {
          return scales.squareScale(item.value as number, item.uncertainty as number);
        }}
        experimentsColorScale={(item) => {
          return scales.squareScale(item.measured_yield, 0);
        }}
      >
        <FlameTree.Toolbar>
          <Group align="flex-end" gap="xl">
            <AggregateSelect label="Value aggregation" aggregation={aggregation} setAggregation={setAggregation} />

            <Switch
              label="Synchronize hover"
              mb={8}
              checked={synchronizeHover}
              onChange={(event) => {
                setSynchronizeHover(event.currentTarget.checked);
              }}
            />

            <CutoffSlider mb={8} domain={scales.cutoffDomain} value={cutoff} onChange={setCutoff} />
          </Group>
        </FlameTree.Toolbar>
      </FlameTree>
    </div>
  );
}
