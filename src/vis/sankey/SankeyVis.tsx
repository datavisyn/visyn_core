import { MantineTheme, Stack, lighten, rgba, useMantineTheme, Center } from '@mantine/core';
import * as React from 'react';
import { uniqueId } from 'lodash';
import { css } from '@emotion/react';
import { useAsync } from '../../hooks/useAsync';
import { PlotlyComponent } from '../../plotly';
import { InvalidCols } from '../general/InvalidCols';
import { resolveColumnValues } from '../general/layoutUtils';
import { ICommonVisProps, VisCategoricalColumn, VisColumn } from '../interfaces';
import { ISankeyConfig } from './interfaces';
import { DownloadPlotButton } from '../general/DownloadPlotButton';
import { NAN_REPLACEMENT, VIS_NEUTRAL_COLOR, VIS_UNSELECTED_COLOR } from '../general/constants';
import { selectionColorDark } from '../../utils';

/**
 * Performs the data transformation that maps the fetched data to
 * a Plotly.js compatible format
 *
 * @param data the fetched data
 * @returns a plotly spec
 */
function TransposeData(
  data: {
    info: { description: string; id: string; name: string };
    resolvedValues: {
      id: string;
      val: unknown;
    }[];
  }[],
) {
  let nodeIndex = 0;

  const plotly = {
    nodes: {
      labels: new Array<string>(),
      inverseLookup: [],
    },
    links: {
      source: new Array<number>(),
      target: new Array<number>(),
      value: new Array<number>(),
      inverseLookup: [],
    },
  };

  if (data.length < 2) {
    return null;
  }

  const lanes = data.map((lane) => {
    const values = lane.resolvedValues.map((value) => (value.val === undefined || value.val === null ? NAN_REPLACEMENT : (value.val as string)));
    console.log(values);
    // const nodes = Array.from(new Set(values)).map((value) => ({id: nodeIndex++, value}))
    const nodes = new Array<{ id: number; value; inverseLookup: string[] }>();

    const nodesSet = new Set<string>();
    lane.resolvedValues.forEach((value) => {
      if (nodesSet.has(value.val as string)) {
        nodes.find((node) => node.value === (value.val ?? NAN_REPLACEMENT)).inverseLookup.push(value.id);
      } else {
        nodes.push({ id: nodeIndex++, value: value.val ?? NAN_REPLACEMENT, inverseLookup: [value.id] });
        nodesSet.add(value.val as string);
      }
    });

    for (const node of nodes) {
      plotly.nodes.labels.push(node.value);
      plotly.nodes.inverseLookup.push(node.inverseLookup);
    }

    return {
      info: lane.info,
      nodes,
      values,
    };
  });

  lanes.forEach((lane, i) => {
    if (i === lanes.length - 1) {
      return;
    }

    const next = lanes[i + 1];
    const links: { [index: string]: { [index: string]: { count: number; inverseLookup: string[] } } } = {};

    lane.values.forEach((left, vi) => {
      const right = next.values[vi];

      if (left in links) {
        if (right in links[left]) {
          links[left][right].count += 1;
          links[left][right].inverseLookup.push(vi.toString());
        } else {
          links[left][right] = { count: 1, inverseLookup: [vi.toString()] };
        }
      } else {
        links[left] = {
          [right]: {
            count: 1,
            inverseLookup: [vi.toString()],
          },
        };
      }
    });

    for (const lik in links) {
      if (Object.prototype.hasOwnProperty.call(links, lik)) {
        for (const rik in links[lik]) {
          if (Object.prototype.hasOwnProperty.call(links[lik], rik)) {
            plotly.links.source.push(lane.nodes.find((node) => node.value === lik).id);
            plotly.links.target.push(next.nodes.find((node) => node.value === rik).id);
            plotly.links.value.push(links[lik][rik].count);
            plotly.links.inverseLookup.push(links[lik][rik].inverseLookup);
          }
        }
      }
    }
  });

  return plotly;
}

export async function fetchData(columns: VisColumn[], config: ISankeyConfig) {
  const catCols: VisCategoricalColumn[] = config.catColumnsSelected.map((c) => columns.find((col) => col.info.id === c.id) as VisCategoricalColumn);
  const catColValues2 = await resolveColumnValues(catCols);

  return TransposeData(catColValues2);
}

function isNodeSelected(selection: Set<string>, inverseLookup: Array<string>) {
  if (selection.size <= 0) {
    return false;
  }
  for (const value of inverseLookup) {
    if (selection.has(value)) {
      return true;
    }
  }

  return false;
}

function generatePlotly(data, optimisedSelection: Set<string>) {
  const selected = selectionColorDark;
  const def = optimisedSelection.size > 0 ? VIS_UNSELECTED_COLOR : VIS_NEUTRAL_COLOR;

  return [
    {
      type: 'sankey',
      arrangement: 'fixed',
      orientation: 'h',
      node: {
        pad: 15,
        thickness: 30,
        line: {
          color: 'black',
          width: 0.5,
        },
        label: data.nodes.labels,
        color: data.nodes.labels.map((_, i) => (isNodeSelected(optimisedSelection, data.nodes.inverseLookup[i]) ? selected : def)),
      },
      link: {
        ...data.links,
        color: data.links.value.map((_, i) => (isNodeSelected(optimisedSelection, data.links.inverseLookup[i]) ? selected : def)),
      },
    },
  ];
}

const classes = css({
  flexGrow: 1,
  height: '100%',
  width: '100%',
  overflow: 'hidden',
  position: 'relative',
  // Disable plotly crosshair cursor
  '.nsewdrag': {
    cursor: 'pointer !important',
  },
});

export function SankeyVis({
  config,
  columns,
  selectedList,
  selectionCallback,
  dimensions,
  uniquePlotId,
  showDownloadScreenshot,
}: ICommonVisProps<ISankeyConfig>) {
  const [selection, setSelection] = React.useState<string[]>([]);
  const id = React.useMemo(() => uniquePlotId || uniqueId('SankeyVis'), [uniquePlotId]);
  const { value: data } = useAsync(fetchData, [columns, config]);

  const [plotly, setPlotly] = React.useState<unknown[]>();

  // When we have new data -> recreate plotly
  React.useEffect(() => {
    const optimisedSelection = new Set(selection);

    if (!data) {
      setPlotly(null);
    } else {
      setPlotly(generatePlotly(data, optimisedSelection));
    }
  }, [selection, data]);

  React.useEffect(() => {
    setSelection(selectedList);
  }, [selectedList]);

  return (
    <Stack
      pl={0}
      pr={0}
      className={classes.name}
      style={{
        flexGrow: 1,
        height: '100%',
        width: '100%',
      }}
    >
      {showDownloadScreenshot && plotly ? (
        <Center>
          <DownloadPlotButton uniquePlotId={id} config={config} />
        </Center>
      ) : null}
      {plotly ? (
        <PlotlyComponent
          divId={id}
          data={plotly}
          style={{ width: '100%' }}
          config={{ displayModeBar: false }}
          layout={{
            font: {
              size: 12,
            },
            autosize: true,
          }}
          onClick={(sel) => {
            if (!sel.points[0]) {
              return;
            }

            const element = sel.points[0] as (typeof sel.points)[0] & { index: number };

            if ('sourceLinks' in element) {
              selectionCallback(data.nodes.inverseLookup[element.index]);
            } else {
              selectionCallback(data.links.inverseLookup[element.index]);
            }
          }}
        />
      ) : (
        <Center h="100%">
          <InvalidCols headerMessage="Invalid settings" bodyMessage="To create a sankey chart, select at least 2 columns." />
        </Center>
      )}
    </Stack>
  );
}
