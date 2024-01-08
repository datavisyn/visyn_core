import { Box, alpha, useMantineTheme } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { Stack, Tooltip } from '@mantine6/core';
import { bin as binGenerator, extent, max, scaleBand, scaleLinear, schemeCategory10 } from 'd3v7';
import { MRT_Column, MRT_Header, MRT_TableInstance } from 'mantine-react-table';
import * as React from 'react';

export type Bin = {
  x0: number;
  x1: number;
  length: number;
};

export type Category = {
  value: string;
  length: number;
  color: string;
};

export function createHistogram(x: number[], nBins: number = 10) {
  const domain = extent(x);
  const span = domain[1] - domain[0];
  // Create 10 thresholds
  const thresholds = [...Array.from({ length: nBins - 1 }, (_, i) => domain[0] + (span / nBins) * (i + 1))];

  const hist = binGenerator().domain(domain).thresholds(thresholds);

  return hist(x).map((bin) => ({
    x0: bin.x0,
    x1: bin.x1,
    length: bin.length,
  }));
}

export function createCategories(x: string[]) {
  const values = [...new Set(x)];

  return values.map((value, i) => ({
    value,
    length: x.filter((e) => e === value).length,
    color: schemeCategory10[i],
  }));
}

export function HistogramFilter({
  column,
  header,
  rangeFilterIndex,
  table,
}: {
  column: MRT_Column<any>;
  header: MRT_Header<any>;
  rangeFilterIndex?: number;
  table: MRT_TableInstance<any>;
}) {
  const { width, height, ref } = useElementSize();

  const theme = useMantineTheme();
  const filterValue = column.getFilterValue() as Bin[];

  const [label, setLabel] = React.useState<number>(-1);

  // @ts-ignore
  const thresholds = column.columnDef.thresholds as Bin[];

  const { xScale, yScale } = React.useMemo(() => {
    const domain = [thresholds[0].x0, thresholds[thresholds.length - 1].x1];

    const x = scaleLinear().domain(domain).range([0, width]);

    const y = scaleLinear()
      .range([0, height])
      .domain([0, max(thresholds.map((t) => t.length))]);

    return { xScale: x, yScale: y };
  }, [width, height, thresholds]);

  const handleFilter = (bin: Bin) => {
    column.setFilterValue((prev: Bin[]) => {
      if (!prev) {
        return [bin];
      }

      const index = prev.findIndex((b) => b.x0 === bin.x0 && b.x1 === bin.x1);

      if (index !== -1) {
        const result = prev.filter((_, i) => i !== index);
        return result.length === 0 ? undefined : result;
      }

      return [...prev, bin];
    });
  };

  return (
    <Box style={{ flexGrow: 1, height: 32 }} ref={ref}>
      <Tooltip.Floating
        label={
          <Stack spacing={0}>
            <Box>
              {thresholds[label]?.x0.toPrecision(3)} - ${thresholds[label]?.x1.toPrecision(3)}
            </Box>
            <Box>{thresholds[label]?.length} rows</Box>
          </Stack>
        }
      >
        <svg
          style={{ width: '100%', height: '100%' }}
          onMouseLeave={() => setLabel(-1)}
          onMouseMove={(event) => {
            const index = Math.floor((event.nativeEvent.offsetX / width) * thresholds.length);
            setLabel(index);
          }}
          onClick={(event) => {
            const index = Math.floor((event.nativeEvent.offsetX / width) * thresholds.length);
            handleFilter(thresholds[index]);
          }}
          cursor="pointer"
        >
          {width > 0
            ? thresholds?.map((bin) => {
                return (
                  <rect
                    key={bin.x0}
                    x={xScale(bin.x0) + 1}
                    y={height - yScale(bin.length)}
                    width={xScale(bin.x1) - xScale(bin.x0) - 2}
                    height={yScale(bin.length)}
                    fill={!filterValue || filterValue.find((e) => e.x0 === bin.x0) ? theme.colors.gray[5] : theme.colors.gray[3]}
                  />
                );
              })
            : null}
        </svg>
      </Tooltip.Floating>
    </Box>
  );
}

export function CategoricalFilter({
  column,
  header,
  rangeFilterIndex,
  table,
}: {
  column: MRT_Column<any>;
  header: MRT_Header<any>;
  rangeFilterIndex?: number;
  table: MRT_TableInstance<any>;
}) {
  const { width, height, ref } = useElementSize();

  const theme = useMantineTheme();
  const filterValue = column.getFilterValue() as Category[];
  const [label, setLabel] = React.useState<number>(-1);

  // @ts-ignore
  const categories = column.columnDef.categories as Category[];

  const { xScale, yScale } = React.useMemo(() => {
    const domain = categories.map((c) => c.value);

    const x = scaleBand().domain(domain).range([0, width]);

    const y = scaleLinear()
      .range([0, height])
      .domain([0, max(categories.map((t) => t.length))]);

    return { xScale: x, yScale: y };
  }, [width, height, categories]);

  const handleFilter = (bin: Category) => {
    column.setFilterValue((prev: Category[]) => {
      if (!prev) {
        return [bin];
      }

      const index = prev.findIndex((b) => b.value === bin.value);

      if (index !== -1) {
        const result = prev.filter((_, i) => i !== index);
        return result.length === 0 ? undefined : result;
      }

      return [...prev, bin];
    });
  };

  return (
    <Box style={{ flexGrow: 1, height: 32 }} ref={ref} p={2}>
      <Tooltip.Floating
        label={
          <Stack spacing={0}>
            <Box>{label}</Box>
            <Box>{categories[label]?.length} rows</Box>
          </Stack>
        }
      >
        <svg
          style={{ width: '100%', height: '100%' }}
          onMouseLeave={() => setLabel(-1)}
          onMouseMove={(event) => {
            const index = Math.floor((event.nativeEvent.offsetX / width) * categories.length);
            setLabel(index);
          }}
          onClick={(event) => {
            const index = Math.floor((event.nativeEvent.offsetX / width) * categories.length);
            handleFilter(categories[index]);
          }}
          cursor="pointer"
        >
          {width > 0
            ? categories?.map((cat) => {
                return (
                  <rect
                    key={cat.value}
                    x={xScale(cat.value) + 1}
                    y={height - yScale(cat.length)}
                    width={xScale.bandwidth() - 2}
                    height={yScale(cat.length)}
                    fill={!filterValue || filterValue.find((e) => e.value === cat.value) ? cat.color : alpha(cat.color, 0.5)}
                  />
                );
              })
            : null}
        </svg>
      </Tooltip.Floating>
    </Box>
  );
}
