import { useMantineTheme } from '@mantine/core';
import { bin, brushX, extent, max, scaleLinear, select } from 'd3v7';
import * as React from 'react';

const TEXT_SIZE = 12;

export function Brush({
  x,
  y,
  height,
  width,
  id,
  onBrush,
}: {
  y: number;
  x: number;
  height: number;
  width: number;
  id: string;
  onBrush: (brushArea: [number, number]) => void;
}) {
  React.useEffect(() => {
    const brush = brushX()
      .extent([
        [x, y],
        [x + width, y + height],
      ])
      .on('brush', (e) => {
        onBrush(e.selection as [number, number]);
      })
      .on('end', (e) => {
        if (!e.selection) {
          onBrush(null);
        }
      });

    select(`#brush${id}`).call(brush);
  }, [height, id, onBrush, width, x, y]);

  return <g id={`brush${id}`} />;
}

export function Hist({ x, id }: { x: number[]; id: string }) {
  const ref = React.useRef<SVGSVGElement>();
  const theme = useMantineTheme();
  const [internalBrush, setInternalBrush] = React.useState<number[]>();

  const nBins = 30;

  const histogram = React.useMemo(() => {
    if (!x) {
      return null;
    }

    const domain = extent(x);

    const xScale = scaleLinear().domain(domain).range([0, HISTOGRAM_WIDTH]);

    const span = domain[1] - domain[0];
    // Create 10 thresholds
    const thresholds = [...Array.from({ length: nBins - 1 }, (_, i) => domain[0] + (span / nBins) * (i + 1))];

    const indexedData = x.map((value, i) => ({ value, i }));
    const hist = bin<(typeof indexedData)[0], number>()
      .domain(domain)
      .thresholds(thresholds)
      .value((d) => d.value)(indexedData);

    const yScale = scaleLinear()
      .range([0, HISTOGRAM_HEIGHT - TEXT_SIZE])
      .domain([0, max(hist, (d) => d.length)]);

    return { hist, xScale, yScale, domain };
  }, [x]);

  return (
    <>
      <svg ref={ref} style={{ width: HISTOGRAM_WIDTH, height: HISTOGRAM_HEIGHT }}>
        {histogram?.hist.map((bin) => {
          const width = bin.x1 - bin.x0;

          const selected = internalBrush && internalBrush[0] <= bin.x1 - width / 2 && internalBrush[1] >= bin.x0 + width / 2;

          return (
            <rect
              key={bin.x0}
              fill={selected ? theme.colors.yellow[5] : theme.colors.gray[5]}
              x={histogram.xScale(bin.x0)}
              y={HISTOGRAM_HEIGHT - TEXT_SIZE * 2 - histogram.yScale(bin.length) + TEXT_SIZE}
              height={histogram.yScale(bin.length)}
              width={HISTOGRAM_WIDTH / nBins - 1}
            ></rect>
          );
        })}

        {selectionHistogram?.hist?.map((bin) => {
          return (
            <rect
              key={bin.x0}
              fill={theme.colors.blue[5]}
              x={selectionHistogram.xScale(bin.x0)}
              y={HISTOGRAM_HEIGHT - TEXT_SIZE - selectionHistogram.yScale(bin.length)}
              height={selectionHistogram.yScale(bin.length)}
              width={HISTOGRAM_WIDTH / nBins - 1}
            ></rect>
          );
        })}

        <Brush
          key={lastBrush}
          y={0}
          x={0}
          height={HISTOGRAM_HEIGHT - TEXT_SIZE}
          width={HISTOGRAM_WIDTH}
          onBrush={(brushArea) => {
            if (brushArea) {
              const inverted = [histogram.xScale.invert(brushArea[0]), histogram.xScale.invert(brushArea[1])];

              const bars = histogram.hist
                .filter((bin) => {
                  const width = bin.x1 - bin.x0;
                  return inverted && inverted[0] <= bin.x1 - width / 2 && inverted[1] >= bin.x0 + width / 2;
                })
                .map((bin) => bin.map((d) => d.i))
                .flat();

              setInternalBrush(inverted);

              setBrush({ nodeId: id, brush: inverted, selection: bars });
            } else {
              setBrush(null);
              setInternalBrush(null);
            }
          }}
          id={`brush${id}`}
        />

        {histogram ? (
          <>
            <text fontSize={TEXT_SIZE} x={0} y={HISTOGRAM_HEIGHT}>
              {histogram.domain[0].toFixed(2)}
            </text>
            <text fontSize={TEXT_SIZE} x={HISTOGRAM_WIDTH} y={HISTOGRAM_HEIGHT} textAnchor="end">
              {histogram.domain[1].toFixed(2)}
            </text>
          </>
        ) : null}
      </svg>
    </>
  );
}
