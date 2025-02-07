/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react-compiler/react-compiler */
import * as React from 'react';

import { Affix, Button, Divider, Group, Paper, Tooltip, rem } from '@mantine/core';
import { useMergedRef } from '@mantine/hooks';
import { nanoid } from '@reduxjs/toolkit';
import * as d3 from 'd3v7';
import Flatbush from 'flatbush';
import clamp from 'lodash/clamp';
import groupBy from 'lodash/groupBy';
import range from 'lodash/range';

import { DraggableHierarchy } from './DraggableHierarchy';
import { TooltipContent, TooltipContentBin } from './TooltipContent';
import { generateDarkBorderColor, generateDarkHighlightColor, generateDynamicTextColor } from './colorUtils';
import { FlameBin, ParameterColumn, Row, assignSamplesToBins, estimateTransformForDomain } from './math';
import { FastTextMeasure, m4, useAnimatedTransform, useCanvas, usePan, useTransformScale, useTriggerFrame, useZoom } from '../../vis';

// @TODO use from aevidence
const TrackTooltip = Tooltip.withProps({
  withArrow: true,
  multiline: true,
  maw: rem(500),
  openDelay: 0,
  closeDelay: 0,
  opacity: 0.8,
  offset: 16,
  children: undefined,
  label: undefined,
});

export type FlameTreeProps<V extends Record<string, unknown>> = {
  layering: string[];
  setLayering: (value: string[]) => void;
  definitions: ParameterColumn[];
  experiments: Row[];
  renderExperimentTooltip?: (experiment: Row) => React.ReactNode;
  experimentsColorScale: (experiment: Row) => string;
  colorScale: (bin: V) => string;
  bins: Record<string, FlameBin<V>>;

  itemHeight?: number;

  renderTooltip?: (bin: FlameBin<V>) => React.ReactNode;

  /**
   * If true, the hover state of the bins across all bins with the
   * same attribute value will be synchronized.
   */
  synchronizeHover?: boolean;

  /**
   * Filter that selectively hides bins. Can be used to hide bins based
   * on a cutoff yield for instance.
   */
  filter?: Record<string, boolean>;
};

/**
 * Assigns the named slots to the children of the FlameTree component.
 */
function assignSlots(children: React.ReactNode) {
  let hierarchy: React.ReactNode;
  let toolbar: React.ReactNode;

  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      if (child.type === FlameTree.Hierarchy) {
        hierarchy = child;
      }

      if (child.type === FlameTree.Toolbar) {
        toolbar = child;
      }
    }
  });

  return {
    hierarchy,
    toolbar,
  };
}

export function FlameTree<V extends Record<string, unknown>>({
  definitions,
  layering,
  setLayering,
  experiments,
  renderExperimentTooltip,
  bins,
  renderTooltip,
  colorScale,
  experimentsColorScale,
  filter,
  itemHeight = 80,
  synchronizeHover,
  children,
}: React.PropsWithChildren<FlameTreeProps<V>>) {
  const slots = assignSlots(children);

  const flatBins = React.useMemo(() => {
    return Object.values(bins);
  }, [bins]);

  const [hover, setHover] = React.useState<
    | {
        type: 'bin';
        id: string;
        x: number;
        y: number;
      }
    | {
        type: 'scatter';
        x: number;
        y: number;
        id: number;
      }
  >();

  const experimentAssignment = React.useMemo(() => {
    if (!bins) {
      return undefined;
    }

    const rootBins = Object.values(bins).filter((bin) => bin.y === 0);

    const assignment = assignSamplesToBins(experiments, rootBins, bins);

    return assignment;
  }, [bins, experiments]);

  const { setRef: setCanvasRef, context: ctx, pixelContentWidth, pixelContentHeight, contentHeight, contentWidth, ratio: dpr } = useCanvas();

  const yScale = React.useMemo(() => {
    if (contentHeight === 0 || !ctx || !bins) {
      return undefined;
    }

    return d3.scaleBand(range(0, layering.length), [0, itemHeight * layering.length]).padding(0);
  }, [bins, contentHeight, ctx, itemHeight, layering.length]);

  const [transform, setTransform] = React.useState(m4.identityMatrix4x4());

  const { setRef: setZoomRef } = useZoom({
    value: transform,
    onChange: setTransform,
    constraint: (value) => value,
  });

  const textMeasure = React.useMemo(() => {
    return new FastTextMeasure(`${12 * dpr}px Roboto`);
  }, [dpr]);

  const fetchRect = (invertX: number, yIndex: number) => {
    const treeBin = rbushTree.search(invertX, yIndex + 0.5, invertX, yIndex + 0.5);
    return treeBin[0] !== undefined ? flatBins[treeBin[0]]!.id : undefined;
  };

  const { animate } = useAnimatedTransform({
    onIntermediate: setTransform,
  });

  const xScale = useTransformScale({
    domain: [0, 100],
    range: [0, contentWidth],
    direction: 'x',
    transform,
  });

  const scatterInput = React.useMemo(() => {
    const scatterData: {
      value: {
        stroke: string;
        fill: string;
        yOffset: number;
        row: Row;
      };
      id: string;
      bin: string;
      x0: number;
      x1: number;
      x: number;
      y: number;
    }[] = [];

    if (experimentAssignment && yScale) {
      Object.entries(experimentAssignment).forEach(([key, value]) => {
        const experimentBin = bins[key]!;

        value.forEach((sample, index) => {
          const fill = experimentsColorScale(sample);

          scatterData.push({
            id: nanoid(),
            value: {
              fill,
              stroke: generateDarkBorderColor(fill),
              yOffset: yScale(experimentBin.y)! + yScale.bandwidth() + 30,
              row: sample,
            },
            bin: key,
            x0: experimentBin.x0,
            x1: experimentBin.x1,
            // x and y are in percent of the bin
            x: (experimentBin.x0 + experimentBin.x1) / 2,
            y: 30 + (index / value.length) * 70,
          });
        });
      });

      return {
        flat: scatterData,
        byBin: groupBy(scatterData, 'bin'),
      };
    }

    return undefined;
  }, [bins, experimentAssignment, experimentsColorScale, yScale]);

  const hoveredBin = hover && hover.type === 'bin' ? bins[hover.id] : undefined;
  const hoveredScatter = hover && hover.type === 'scatter' && scatterInput ? scatterInput.flat[hover.id] : undefined;

  const scatterSpatialIndex = React.useMemo(() => {
    if (!scatterInput) {
      return undefined;
    }

    const index = new Flatbush(scatterInput.flat.length);

    scatterInput.flat.forEach((scatter) => {
      index.add(scatter.x, scatter.y);
    });

    index.finish();

    return index;
  }, [scatterInput]);

  const fetchScatter = (invertX: number, invertY: number) => {
    if (!scatterSpatialIndex || !scatterInput) {
      return undefined;
    }

    const scatterMark = scatterSpatialIndex.neighbors(invertX, invertY, 1);
    return scatterMark[0] !== undefined ? scatterMark[0] : undefined;
  };

  const { setRef: setPanRef, state: dragState } = usePan({
    value: transform,
    onChange: setTransform,
    onClick: (event) => {
      if (!xScale || !yScale) {
        return;
      }

      const yIndex = Math.floor(event.nativeEvent.offsetY / yScale.bandwidth());
      const invertX = xScale.scaled.invert(event.nativeEvent.offsetX);
      const bin = fetchRect(invertX, yIndex);

      if (!bin) {
        return;
      }

      const estimatedTransform = estimateTransformForDomain({
        originScale: xScale.base,
        domain: [bins[bin]!.x0, bins[bin]!.x1],
        containerWidth: contentWidth,
      });

      animate(transform, estimatedTransform);
    },
    constraint: (value) => value,
  });

  const setRef = useMergedRef(setCanvasRef, setZoomRef, setPanRef);

  const rbushTree = React.useMemo(() => {
    const binSpatialIndex = new Flatbush(flatBins.length);

    flatBins.forEach((bin) => {
      binSpatialIndex.add(bin.x0, bin.y, bin.x1, bin.y + 1);
    });

    binSpatialIndex.finish();

    /* const items = flatBins.map((item, index) => {
      return {
        value: item,
        minX: item.x0,
        maxX: item.x1,
        minY: item.y,
        maxY: item.y + 1,
      };
    });

    const tree = new RBush<(typeof items)[0]>();
    tree.load(items);
    return tree; */
    return binSpatialIndex;
  }, [flatBins]);

  useTriggerFrame(() => {
    if (!ctx || !xScale || !yScale) {
      return;
    }

    // const itemHeight = 100 * dpr;

    ctx.clearRect(0, 0, pixelContentWidth, pixelContentHeight);

    ctx.font = `${12 * dpr}px Roboto`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    flatBins.forEach((bin) => {
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

      // Dont draw bins that are below the cutoff
      if (filter?.[bin.id] === true) {
        return;
      }

      const border = x1 - x0 < 8 * dpr ? 0 : 1;

      const fixedX0 = x0 + border;
      const fixedX1 = x1 - border;

      // const fixedY0 = Math.ceil(y0) + dpr;
      // const fixedY1 = Math.floor(y1) - dpr;
      const fixedY0 = y0 + border;
      const fixedY1 = y1 - border;

      const color = colorScale(bin.value);

      const isHovered = synchronizeHover ? hoveredBin && hoveredBin?.label === bin.label : hover && hover.id === bin.id;
      const fillColor = isHovered ? generateDarkHighlightColor(color) : color;

      ctx.fillStyle = fillColor;
      ctx.lineWidth = dpr;

      ctx.fillRect(fixedX0, fixedY0, fixedX1 - fixedX0, fixedY1 - fixedY0);
      if (isHovered && synchronizeHover) {
        ctx.strokeStyle = 'red';
        ctx.strokeRect(fixedX0, fixedY0, fixedX1 - fixedX0, fixedY1 - fixedY0);
      }

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

    if (scatterInput) {
      // If we have an experiment assignment, we can draw the samples below the last bins
      Object.entries(scatterInput?.byBin ?? {}).forEach(([key, samples]) => {
        const sampleYScale = d3.scaleLinear([0, 100], [0, 100]);

        samples.forEach((sample) => {
          const x = xScale.scaled(sample.x)! * dpr;
          const y = (itemHeight * layering.length + sampleYScale(sample.y)!) * dpr;

          if (hover?.type === 'scatter' && sample === scatterInput.flat[hover.id]!) {
            ctx.fillStyle = generateDarkHighlightColor(sample.value.fill);
            ctx.strokeStyle = generateDarkBorderColor(sample.value.fill);

            ctx.beginPath();
            ctx.arc(x, y, 5 * dpr, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          } else {
            ctx.fillStyle = sample.value.fill;

            ctx.beginPath();
            ctx.arc(x, y, 5 * dpr, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      });
    }
  }, [
    ctx,
    xScale,
    yScale,
    pixelContentWidth,
    pixelContentHeight,
    dpr,
    flatBins,
    scatterInput,
    filter,
    colorScale,
    synchronizeHover,
    hoveredBin,
    hover,
    textMeasure,
    itemHeight,
    layering.length,
  ]);

  return (
    <div>
      <Paper
        withBorder
        m="xs"
        p="xs"
        style={{
          display: 'grid',
          gap: 'var(--mantine-spacing-xs)',
          gridTemplateRows: 'max-content max-content max-content',
          gridTemplateColumns: '300px max-content 1fr',
          gridTemplateAreas: `
          'header header header'
          'hline hline hline'
          'navbar vline main'
        `,
        }}
      >
        {slots.toolbar ?? (
          <Group style={{ gridArea: 'header' }} my="xs" align="flex-end">
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
        )}

        <Divider style={{ gridArea: 'vline' }} my={-10} orientation="vertical" />
        <Divider style={{ gridArea: 'hline' }} mx={-10} orientation="horizontal" />

        {slots.hierarchy ?? (
          <Hierarchy>
            <DraggableHierarchy itemHeight={itemHeight} layering={layering} setLayering={setLayering} definitions={definitions} />
          </Hierarchy>
        )}

        <div style={{ position: 'relative', display: 'flex', gridArea: 'main' }}>
          {hover && hoveredBin ? (
            <TrackTooltip label={renderTooltip ? renderTooltip(hoveredBin) : <TooltipContentBin bin={hoveredBin} />} opened>
              <div style={{ position: 'absolute', top: hover.y, left: hover.x }} />
            </TrackTooltip>
          ) : null}
          {hover && hoveredScatter ? (
            <TrackTooltip
              label={
                renderExperimentTooltip ? (
                  renderExperimentTooltip(hoveredScatter.value.row)
                ) : (
                  <TooltipContent layering={layering} row={hoveredScatter.value.row} />
                )
              }
              opened
            >
              <div style={{ position: 'absolute', top: hover.y, left: hover.x }} />
            </TrackTooltip>
          ) : null}
          <canvas
            ref={setRef}
            width={pixelContentWidth}
            height={pixelContentHeight}
            style={{
              width: '100%',
              height: layering.length * itemHeight + 100,
              cursor: 'pointer',
            }}
            onMouseLeave={() => setHover(undefined)}
            onMouseMove={(event) => {
              if (!xScale || !yScale || !scatterInput || !scatterSpatialIndex) {
                return;
              }

              const clientX = event.nativeEvent.offsetX;
              const clientY = event.nativeEvent.offsetY;

              const invertX = xScale.scaled.invert(clientX);

              if (clientY < itemHeight * layering.length) {
                // Icicle plot
                const invertY = Math.floor(clientY / yScale.bandwidth());

                const icicleMark = fetchRect(invertX, invertY);

                if (icicleMark !== undefined) {
                  if (filter?.[icicleMark] === true) {
                    setHover(undefined);
                  } else {
                    setHover({ id: icicleMark, x: clientX, y: invertY * yScale.bandwidth(), type: 'bin' });
                  }
                }
              } else {
                // Scatter plot
                const sampleYScale = d3.scaleLinear([0, 100], [0, 100]);
                const invertY = sampleYScale.invert(clientY - itemHeight * layering.length);

                const scatterMark = fetchScatter(invertX, invertY);

                if (scatterMark !== undefined) {
                  const sample = scatterInput.flat[scatterMark]!;
                  setHover({ id: scatterMark, x: xScale.scaled(sample.x), y: itemHeight * layering.length + sampleYScale(sample.y), type: 'scatter' });
                } else {
                  setHover(undefined);
                }
              }
            }}
          />

          {dragState === 'drag' ? <Affix inset={0} /> : null}
        </div>
      </Paper>
    </div>
  );
}

function Hierarchy({ children }: React.PropsWithChildren<object>) {
  return (
    <div
      style={{
        gridArea: 'navbar',
      }}
    >
      {children}
    </div>
  );
}

function Toolbar({ children }: React.PropsWithChildren<object>) {
  return (
    <div
      style={{
        gridArea: 'header',
      }}
    >
      {children}
    </div>
  );
}

/**
 * Can be overridden to provide a custom hierarchy component.
 */
FlameTree.Hierarchy = Hierarchy;

/**
 * Can be overridden to provide a custom toolbar component.
 */
FlameTree.Toolbar = Toolbar;
