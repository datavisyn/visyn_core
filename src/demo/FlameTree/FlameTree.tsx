/* eslint-disable react-compiler/react-compiler */
import * as React from 'react';

import { css, cx } from '@emotion/css';
import { faGripVertical } from '@fortawesome/free-solid-svg-icons/faGripVertical';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { Affix, Button, Divider, Group, Paper, Select, Text, ThemeIcon, Tooltip, rem } from '@mantine/core';
import { useListState, useMergedRef } from '@mantine/hooks';
import * as d3 from 'd3v7';
import clamp from 'lodash/clamp';
import groupBy from 'lodash/groupBy';
import map from 'lodash/map';
import max from 'lodash/max';
import mean from 'lodash/mean';
import min from 'lodash/min';
import range from 'lodash/range';
import sortBy from 'lodash/sortBy';
import uniq from 'lodash/uniq';
import RBush from 'rbush';
import * as vsup from 'vsup';

import { useCase1 } from './case_study_1';
import { generateDarkBorderColor, generateDarkHighlightColor, generateDynamicTextColor } from './colorUtils';
import {
  CategoricalParameterColumn,
  NumericalParameterColumn,
  ParameterColumn,
  Row,
  assignSamplesToBins,
  createParameterHierarchy,
  estimateTransformForDomain,
} from './math';
import { FastTextMeasure, m4, useAnimatedTransform, useCanvas, usePan, useTransformScale, useTriggerFrame, useZoom } from '../../vis';

console.log(useCase1);

const classItem = css`
  display: flex;
  align-items: center;
  border-radius: var(--mantine-radius-md);
  border: 1px solid var(--mantine-color-blue-outline);
  padding: var(--mantine-spacing-sm) var(--mantine-spacing-xl);
  padding-left: calc(var(--mantine-spacing-xl) - var(--mantine-spacing-md));
  background-color: var(--mantine-color-white);
  height: 72px;
  margin-bottom: 28px;
`;

const classDragging = css`
  box-shadow: var(--mantine-shadow-sm);
`;

const classDragHandle = css`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: light-dark(var(--mantine-color-gray-6), var(--mantine-color-dark-1));
  padding-right: var(--mantine-spacing-md);
`;

// @TODO use from aevidence
const TrackTooltip = Tooltip.withProps({
  withArrow: true,
  multiline: true,
  maw: rem(320),
  openDelay: 0,
  closeDelay: 0,
  opacity: 0.8,
  offset: 16,
  children: undefined,
  label: undefined,
});

const NEUTRAL_COLOR = '#DCDCDC';

const layers = ['aryl_halide_file_name_exp_param', 'base_file_name_exp_param', 'ligand_file_name_exp_param', 'additive_file_name_exp_param'];

const ArylColumn: ParameterColumn = {
  key: 'aryl_halide_file_name_exp_param',
  domain: uniq(map(useCase1, 'aryl_halide_file_name_exp_param')),
  type: 'categorical',
};

const AdditiveColumn: ParameterColumn = {
  key: 'additive_file_name_exp_param',
  domain: uniq(map(useCase1, 'additive_file_name_exp_param')),
  type: 'categorical',
};

const LigandColumn: ParameterColumn = {
  key: 'ligand_file_name_exp_param',
  domain: uniq(map(useCase1, 'ligand_file_name_exp_param')),
  type: 'categorical',
};

const BaseColumn: ParameterColumn = {
  key: 'base_file_name_exp_param',
  domain: uniq(map(useCase1, 'base_file_name_exp_param')),
  type: 'categorical',
};

console.log(ArylColumn, AdditiveColumn, LigandColumn);

export function FlameTree() {
  const [state, handlers] = useListState(layers);

  const [aggregation, setAggregation] = React.useState<string | null>('max');

  const parameterDefinitions = React.useMemo(() => {
    return [ArylColumn, BaseColumn, LigandColumn, AdditiveColumn] as (CategoricalParameterColumn | NumericalParameterColumn)[];
  }, []);

  /* const parameterDefinitions = React.useMemo(() => {
    return [
      {
        key: 'base',
        domain: BASES,
        type: 'categorical',
      },
      {
        key: 'ligand',
        domain: LIGAND,
        type: 'categorical',
      },
      {
        key: 'temperature',
        domain: [-10, 110],
        type: 'numerical',
      },
      {
        key: 'age',
        domain: [15, 70],
        type: 'numerical',
      },
    ] as (CategoricalParameterColumn | NumericalParameterColumn)[];
  }, []); */

  const experiments = React.useMemo(() => {
    return useCase1;
  }, []);

  const bins = React.useMemo(() => {
    const phier = createParameterHierarchy(parameterDefinitions, useCase1, state, [0, 100], (items) => {
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
    const byLevel = groupBy(phier, 'y');

    return {
      byId: phier,
      byY: byLevel,
      flat: Object.values(phier),
    };
  }, [state, parameterDefinitions, aggregation]);

  const [hover, setHover] = React.useState<{
    index: number;
    x: number;
    y: number;
  }>();

  const experimentAssignment = React.useMemo(() => {
    if (!bins) {
      return undefined;
    }

    const assignment = assignSamplesToBins(experiments, bins.byY['0']!, bins.byId);

    return assignment;
  }, [bins, experiments]);

  const { setRef: setCanvasRef, context: ctx, pixelContentWidth, pixelContentHeight, contentHeight, contentWidth, ratio: dpr } = useCanvas();

  const yScale = React.useMemo(() => {
    if (contentHeight === 0 || !ctx || !bins) {
      return undefined;
    }

    return d3.scaleBand(range(0, state.length), [0, contentHeight - 100]).padding(0);
  }, [bins, contentHeight, ctx, state.length]);

  const colorScale = React.useMemo(() => {
    return d3
      .scaleSequential()
      .domain([0, 100])
      .interpolator((t) => d3.hsl(45, t * 0.9, 0.5).toString());
  }, []);

  const [transform, setTransform] = React.useState(m4.identityMatrix4x4());

  const { setRef: setZoomRef } = useZoom({
    value: transform,
    onChange: setTransform,
    constraint: (value) => value,
  });

  const textMeasure = React.useMemo(() => {
    return new FastTextMeasure(`${12 * dpr}px Roboto`);
  }, [dpr]);

  const { animate } = useAnimatedTransform({
    onIntermediate: setTransform,
  });

  const xScale = useTransformScale({
    domain: [0, 100],
    range: [0, contentWidth],
    direction: 'x',
    transform,
  });

  const scales = React.useMemo(() => {
    const binDomain = [0, max(bins.flat.map((bin) => bin.value.value as number))];
    const squareQuantization = vsup.squareQuantization().n(10).valueDomain(binDomain).uncertaintyDomain([0, 1]);
    const squareScale = vsup.scale().quantize(squareQuantization).range(d3.interpolateCividis);

    // console.log(squareQuantization(40, 0.5), squareScale(16, 2.5));

    const heatLegend = vsup.legend.heatmapLegend().scale(squareScale).size(150).x(60).y(160);

    // Add legend to svg
    const svg = d3.select('#mylegend').append('g').call(heatLegend);

    return {
      squareQuantization,
      squareScale,
      heatLegend,
    };
  }, [bins.flat]);

  const scatterInput = React.useMemo(() => {
    const scatterData: {
      value: {
        stroke: string;
        fill: string;
        x: number;
        y: number;
        yOffset: number;
        row: Row;
      };
      minX: number;
      minY: number;
      maxX: number;
      maxY: number;
    }[] = [];

    if (experimentAssignment && yScale) {
      Object.entries(experimentAssignment).forEach(([key, value]) => {
        const experimentBin = bins.byId[key]!;

        value.forEach((sample, index) => {
          const fill = colorScale(sample.measured_yield as number);

          scatterData.push({
            value: {
              fill,
              stroke: generateDarkBorderColor(fill),
              x: (experimentBin.x0 + experimentBin.x1) / 2,
              y: (index / value.length) * 100,
              yOffset: yScale(experimentBin.y)! + yScale.bandwidth() + 30,
              row: sample,
            },
            minX: experimentBin.x0,
            maxX: experimentBin.x1,
            minY: (index / value.length) * 100,
            maxY: (index / value.length) * 100,
          });
        });
      });

      const scatterTree = new RBush();
      scatterTree.load(scatterData);

      return {
        tree: scatterTree,
        data: scatterData,
      };
    }

    return undefined;
  }, [bins.byId, experimentAssignment, yScale]);

  const { setRef: setPanRef, state: dragState } = usePan({
    value: transform,
    onChange: setTransform,
    onClick: (event) => {
      if (!xScale || !yScale) {
        return;
      }

      const yIndex = Math.floor(event.nativeEvent.offsetY / yScale.bandwidth());
      const invertX = xScale.scaled.invert(event.nativeEvent.offsetX);
      const bin = bins.flat.findIndex((b) => b.y === yIndex && invertX >= b.x0 && invertX <= b.x1);

      if (bin === -1) {
        return;
      }

      const estimatedTransform = estimateTransformForDomain({
        originScale: xScale.base,
        domain: [bins.flat[bin]!.x0, bins.flat[bin]!.x1],
        containerWidth: contentWidth,
      });

      animate(transform, estimatedTransform);
    },
    constraint: (value) => value,
  });

  const setRef = useMergedRef(setCanvasRef, setZoomRef, setPanRef);

  const rbushTree = React.useMemo(() => {
    const items = bins.flat.map((item, index) => {
      return {
        value: item,
        index,
        minX: item.x0,
        maxX: item.x1,
        minY: item.y,
        maxY: item.y + 1,
      };
    });

    const tree = new RBush<(typeof items)[0]>();
    tree.load(items);
    return tree;
  }, [bins.flat]);

  useTriggerFrame(
    () => {
      if (!ctx || !xScale || !yScale) {
        return;
      }

      // const itemHeight = 100 * dpr;

      ctx.clearRect(0, 0, pixelContentWidth, pixelContentHeight);

      ctx.font = `${12 * dpr}px Roboto`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      bins.flat.forEach((bin, index) => {
        const x0 = xScale.scaled(bin.x0) * dpr;
        const x1 = xScale.scaled(bin.x1) * dpr;

        const y0 = yScale(bin.y)! * dpr;
        const y1 = y0 + yScale.bandwidth() * dpr;

        // Optimization: Do not draw if the bin is outside the visible area
        if (x1 < 0 || x0 > pixelContentWidth || y1 < 0 || y0 > pixelContentHeight) {
          return;
        }

        // Optimization: Do not draw if the bin is too small
        if (x1 - x0 < 1) {
          return;
        }

        const fixedX0 = x0 + 1;
        const fixedX1 = x1 - 1;

        // const fixedY0 = Math.ceil(y0) + dpr;
        // const fixedY1 = Math.floor(y1) - dpr;
        const fixedY0 = y0 + 1;
        const fixedY1 = y1 - 1;

        const color = scales.squareScale(bin.value.value as number, bin.value.uncertainty as number);
        const fillColor = hover?.index === index ? generateDarkHighlightColor(color) : color;

        ctx.fillStyle = fillColor;
        ctx.lineWidth = 1;

        ctx.fillRect(fixedX0, fixedY0, fixedX1 - fixedX0, fixedY1 - fixedY0);

        if (x1 - x0 > 30 * dpr) {
          // If we have more than 30 pixels of width, we can truncate the text
          const { truncatedLabel, truncatedWidth } = textMeasure.fastTextEllipsis(bin.label, x1 - x0 - 3 * dpr);

          const c = (x0 + x1) / 2;
          ctx.fillStyle = generateDynamicTextColor(fillColor);
          ctx.fillText(
            truncatedLabel,
            clamp(c, Math.min(x1 - truncatedWidth / 2, truncatedWidth / 2), Math.max(x0 + truncatedWidth / 2, pixelContentWidth - truncatedWidth / 2)),
            (y0 + y1) / 2,
          );
        } else if (x1 - x0 > 12 * dpr) {
          // If we have between 12 and 30 pixels of width, we can rotate the text
          const { truncatedLabel } = textMeasure.fastTextEllipsis(bin.label, y1 - y0 - 3 * dpr);

          ctx.save();
          ctx.translate((x0 + x1) / 2, (y0 + y1) / 2);
          ctx.rotate(Math.PI / 2);
          ctx.fillStyle = generateDynamicTextColor(fillColor);
          ctx.fillText(truncatedLabel, 0, 0);
          ctx.restore();
        }
      });

      // If we have an experiment assignment, we can draw the samples below the last bins
      if (experimentAssignment && scatterInput) {
        const sampleYScale = d3.scaleLinear().domain([0, 100]).range([0, 50]);

        scatterInput.data.forEach((scatter) => {
          const x = xScale.scaled(scatter.value.x) * dpr;
          const y = scatter.value.yOffset * dpr + sampleYScale(scatter.value.y)! * dpr;

          // ctx.fillStyle = scales.squareScale(scatter.value.row.measured_yield as number, 0);
          // ctx.strokeStyle = generateDarkBorderColor(NEUTRAL_COLOR);
          ctx.strokeStyle = scatter.value.stroke;
          ctx.lineWidth = 1;
          ctx.fillStyle = scatter.value.fill;

          ctx.beginPath();
          ctx.arc(x, y, 5 * dpr, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });
      }
    },
    [bins.flat, ctx, dpr, experimentAssignment, hover?.index, pixelContentHeight, pixelContentWidth, scales, scatterInput, textMeasure, xScale, yScale],
    'profile',
  );

  const items = state.map((item, index) => (
    <Draggable key={item} index={index} draggableId={item}>
      {(provided, snapshot) => (
        <div className={cx(classItem, { [classDragging]: snapshot.isDragging })} ref={provided.innerRef} {...provided.draggableProps}>
          <div {...provided.dragHandleProps} className={classDragHandle}>
            <ThemeIcon variant="white" c="gray.6">
              <FontAwesomeIcon icon={faGripVertical} fontWeight={500} />
            </ThemeIcon>
          </div>
          <div style={{ flexGrow: 1 }}>
            <Group>
              <Text fw={500} truncate style={{ width: 0, flexGrow: 1 }}>
                {item}
              </Text>
            </Group>
            <Text c="dimmed" size="sm">
              {(() => {
                const definition = parameterDefinitions.find((entry) => entry.key === item)!;
                return `${definition.type}`;
              })()}
            </Text>
          </div>
        </div>
      )}
    </Draggable>
  ));

  return (
    <div>
      <Paper
        withBorder
        m="xs"
        p="xs"
        style={{
          display: 'grid',
          gap: rem(16),
          gridTemplateRows: '70px max-content',
          gridTemplateColumns: '300px max-content 1fr',
          gridTemplateAreas: `
          'nothing divider header'
          'navbar divider main'
        `,
        }}
      >
        <Group style={{ gridArea: 'header' }} my="xs" align="flex-end">
          <Button size="sm" variant="outline" onClick={() => {}}>
            Add attribute
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              animate(transform, m4.identityMatrix4x4());
            }}
          >
            Reset zoom
          </Button>
          <Select
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
        </Group>

        <Divider style={{ gridArea: 'divider' }} orientation="vertical" />

        <div
          style={{
            gridArea: 'navbar',
            paddingTop: rem(16),
          }}
        >
          <DragDropContext onDragEnd={({ destination, source }) => handlers.reorder({ from: source.index, to: destination?.index || 0 })}>
            <Droppable droppableId="dnd-list" direction="vertical">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {items}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <div style={{ position: 'relative', display: 'flex', gridArea: 'main' }}>
          {hover ? (
            <TrackTooltip label={bins.flat[hover.index]!.label} opened>
              <div style={{ position: 'absolute', top: hover.y, left: hover.x }} />
            </TrackTooltip>
          ) : null}
          <canvas
            ref={setRef}
            width={pixelContentWidth}
            height={pixelContentHeight}
            style={{
              width: '100%',
              height: state.length * 100 + 100,
              cursor: 'pointer',
            }}
            onMouseLeave={() => setHover(undefined)}
            onMouseMove={(event) => {
              if (!xScale || !yScale || !scatterInput) {
                return;
              }

              const yIndex = Math.floor(event.nativeEvent.offsetY / yScale.bandwidth());
              const invertX = xScale.scaled.invert(event.nativeEvent.offsetX);

              const treeBin = rbushTree.search({
                minX: invertX,
                maxX: invertX,
                minY: yIndex + 0.5,
                maxY: yIndex + 0.5,
              });

              const icicleMark = treeBin[0]?.index;

              if (icicleMark !== undefined) {
                setHover({ index: icicleMark, x: event.nativeEvent.offsetX, y: yIndex * yScale.bandwidth() });
                return;
              }

              const scatterMark = scatterInput.tree.search({
                minX: invertX,
                maxX: invertX,
                minY: yIndex,
                maxY: yIndex,
              });
            }}
          />

          {dragState === 'drag' ? <Affix inset={0} /> : null}
        </div>
      </Paper>
      <svg id="mylegend" style={{ height: 400 }} />
    </div>
  );
}
