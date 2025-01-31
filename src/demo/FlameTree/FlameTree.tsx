/* eslint-disable react-compiler/react-compiler */
import * as React from 'react';

import { css, cx } from '@emotion/css';
import { faGripVertical } from '@fortawesome/free-solid-svg-icons/faGripVertical';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { Affix, Button, Divider, Group, Paper, Text, ThemeIcon, Tooltip, rem } from '@mantine/core';
import { useListState, useMergedRef } from '@mantine/hooks';
import { interpolateReds, scaleSequential } from 'd3v7';
import clamp from 'lodash/clamp';
import groupBy from 'lodash/groupBy';

import { generateDarkBorderColor, generateDarkHighlightColor, generateDynamicTextColor } from './colorUtils';
import { CategoricalParameterColumn, NumericalParameterColumn, createParameterHierarchy, estimateTransformForDomain } from './math';
import { FastTextMeasure, m4, useAnimatedTransform, useCanvas, usePan, useTransformScale, useTriggerFrame, useZoom } from '../../vis';

const classItem = css`
  display: flex;
  align-items: center;
  border-radius: var(--mantine-radius-md);
  border: 1px solid light-dark(var(--mantine-color-gray-2), var(--mantine-color-dark-5));
  padding: var(--mantine-spacing-sm) var(--mantine-spacing-xl);
  padding-left: calc(var(--mantine-spacing-xl) - var(--mantine-spacing-md));
  background-color: light-dark(var(--mantine-color-white), var(--mantine-color-dark-5));
  margin-bottom: 30px;
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
  padding-left: var(--mantine-spacing-md);
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

const BASES = ['Aspirin', 'Ibuprofen', 'Paracetamol'];
const LIGAND = ['Axon', 'Benzene', 'Cyclohexane', 'Ethanol', 'Methanol', 'Water'];

function generateTestData() {
  return Array.from({ length: 1000 }, (_, i) => i).map((i) => ({
    base: BASES[Math.floor(Math.random() * BASES.length)]!,
    temperature: -5 + Math.floor(Math.random() * 100) * 1.1,
    ligand: LIGAND[Math.floor(Math.random() * LIGAND.length)]!,
    age: 15 + Math.floor(Math.random() * 55),
    value: Math.floor(Math.random() * 100),
  }));
}

const layers = ['temperature', 'ligand', 'base', 'age'];

export function FlameTree() {
  const [state, handlers] = useListState(layers);

  const parameterDefinitions = React.useMemo(() => {
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
        domain: [0, 100],
        type: 'numerical',
      },
      {
        key: 'age',
        domain: [15, 70],
        type: 'numerical',
      },
    ] as (CategoricalParameterColumn | NumericalParameterColumn)[];
  }, []);

  const bins = React.useMemo(() => {
    const phier = createParameterHierarchy(parameterDefinitions, generateTestData(), state, [0, 100]);
    const byLevel = groupBy(phier, 'y');

    return {
      byId: phier,
      byY: byLevel,
      flat: Object.values(phier),
    };
  }, [state, parameterDefinitions]);

  const [hover, setHover] = React.useState<{
    index: number;
    x: number;
    y: number;
  }>();

  const { setRef: setCanvasRef, context: ctx, pixelContentWidth, pixelContentHeight, contentHeight, contentWidth, ratio: dpr } = useCanvas();

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

  const { setRef: setPanRef, state: dragState } = usePan({
    value: transform,
    onChange: setTransform,
    onClick: (event) => {
      if (!xScale) {
        return;
      }

      const yIndex = Math.floor(event.nativeEvent.offsetY / 100);
      const invertX = xScale.scaled.invert(event.nativeEvent.offsetX);
      const bin = bins.flat.findIndex((b) => b.y === yIndex && invertX >= b.x0 && invertX <= b.x1);

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

  useTriggerFrame(() => {
    if (!ctx || !xScale) {
      return;
    }

    // Gray to yellow
    const colorScale = scaleSequential().domain([0, 100]).interpolator(interpolateReds);

    const itemHeight = 100 * dpr;

    ctx.clearRect(0, 0, pixelContentWidth, pixelContentHeight);

    ctx.font = `${12 * dpr}px Roboto`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    bins.flat.forEach((bin, index) => {
      const x0 = xScale.scaled(bin.x0) * dpr;
      const x1 = xScale.scaled(bin.x1) * dpr;

      const y0 = bin.y * itemHeight;
      const y1 = (bin.y + 1) * itemHeight;

      // Optimization: Do not draw if the bin is outside the visible area
      if (x1 < 0 || x0 > pixelContentWidth || y1 < 0 || y0 > pixelContentHeight) {
        return;
      }

      const fixedX0 = Math.floor(xScale.scaled(bin.x0) * dpr) + dpr;
      const fixedX1 = Math.ceil(xScale.scaled(bin.x1) * dpr) - dpr;

      const fixedY0 = Math.floor(bin.y * itemHeight) + dpr;
      const fixedY1 = Math.ceil((bin.y + 1) * itemHeight) - dpr;

      const color = colorScale(bin.value);
      const fillColor = hover?.index === index ? generateDarkHighlightColor(color) : color;

      ctx.fillStyle = fillColor;
      ctx.strokeStyle = generateDarkBorderColor(fillColor);
      ctx.lineWidth = 1;

      ctx.fillRect(fixedX0, fixedY0, fixedX1 - fixedX0, fixedY1 - fixedY0);
      ctx.strokeRect(fixedX0, fixedY0, fixedX1 - fixedX0, fixedY1 - fixedY0);

      // Optimization: Do not draw text if the bin is too small
      if (x1 - x0 > 30 * dpr) {
        const { truncatedLabel, truncatedWidth } = textMeasure.fastTextEllipsis(bin.label, x1 - x0 - 3 * dpr);

        const c = (x0 + x1) / 2;
        ctx.fillStyle = generateDynamicTextColor(fillColor);
        ctx.fillText(
          truncatedLabel,
          clamp(c, Math.min(x1 - truncatedWidth / 2, truncatedWidth / 2), Math.max(x0 + truncatedWidth / 2, pixelContentWidth - truncatedWidth / 2)),
          (y0 + y1) / 2,
        );
      } else if (x1 - x0 > 6 * dpr) {
        // Draw vertical text instead
        ctx.save();
        ctx.translate((x0 + x1) / 2, (y0 + y1) / 2);
        ctx.rotate(Math.PI / 2);
        ctx.fillStyle = generateDynamicTextColor(fillColor);
        ctx.fillText(bin.label, 0, 0);
        ctx.restore();
      }
    });
  }, [bins, ctx, dpr, hover?.index, pixelContentHeight, pixelContentWidth, textMeasure, xScale]);

  const items = state.map((item, index) => (
    <Draggable key={item} index={index} draggableId={item}>
      {(provided, snapshot) => (
        <div className={cx(classItem, { [classDragging]: snapshot.isDragging })} ref={provided.innerRef} {...provided.draggableProps}>
          <div {...provided.dragHandleProps} className={classDragHandle}>
            <ThemeIcon variant="white" c="gray.6">
              <FontAwesomeIcon icon={faGripVertical} fontWeight={500} />
            </ThemeIcon>
          </div>
          <div>
            <Text fw={500}>{item}</Text>
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
    <Paper
      withBorder
      m="xs"
      p="xs"
      style={{
        display: 'grid',
        gap: rem(16),
        gridTemplateRows: 'max-content max-content 1fr',
        gridTemplateColumns: '300px max-content 1fr',
        gridTemplateAreas: `
          'nothing divider header'
          'navbar divider main'
        `,
        height: 500,
      }}
    >
      <Group style={{ gridArea: 'header' }} my="xs">
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
          <TrackTooltip label={bins.flat[hover.index]!.key} opened>
            <div style={{ position: 'absolute', top: hover.y, left: hover.x }} />
          </TrackTooltip>
        ) : null}
        <canvas
          ref={setRef}
          width={pixelContentWidth}
          height={pixelContentHeight}
          style={{
            width: '100%',
            height: '100%',
            cursor: 'pointer',
          }}
          onMouseLeave={() => setHover(undefined)}
          onMouseMove={(event) => {
            if (!xScale) {
              return;
            }

            const yIndex = Math.floor(event.nativeEvent.offsetY / 100);
            const invertX = xScale.scaled.invert(event.nativeEvent.offsetX);
            const bin = bins.flat.findIndex((b) => b.y === yIndex && invertX >= b.x0 && invertX <= b.x1);

            if (bin !== -1) {
              setHover({ index: bin, x: event.nativeEvent.offsetX, y: yIndex * 100 });
            } else if (bin === -1 && hover) {
              setHover(undefined);
            }
          }}
        />

        {dragState === 'drag' ? <Affix inset={0} /> : null}
      </div>
    </Paper>
  );
}
