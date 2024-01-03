import * as React from 'react';
import { Divider, Loader, Select, SimpleGrid, Stack, Text, Box } from '@mantine/core';
import { MRT_ColumnDef, MRT_RowSelectionState, MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import { VisynApp, VisynHeader, useVisynAppContext } from '../app';
import { DatavisynTaggle, VisynRanking, autosizeWithSMILESColumn } from '../ranking';
import { defaultBuilder } from '../ranking/EagerVisynRanking';
import { BaseVisConfig, ENumericalColorScaleType, EScatterSelectSettings, ESupportedPlotlyVis, IScatterConfig, Vis } from '../vis';
import { fetchIrisData } from '../vis/stories/Iris.stories';
import { iris } from '../vis/stories/irisData';
import { MyNumberScore, MySMILESScore, MyStringScore } from './scoresUtils';

export function MainApp() {
  const { user } = useVisynAppContext();
  const [visConfig, setVisConfig] = React.useState<BaseVisConfig>({
    type: ESupportedPlotlyVis.SCATTER,
    numColumnsSelected: [
      {
        description: '',
        id: 'sepalLength',
        name: 'Sepal Length',
      },
      {
        description: '',
        id: 'sepalWidth',
        name: 'Sepal Width',
      },
    ],
    color: {
      description: '',
      id: 'species',
      name: 'Species',
    },
    numColorScaleType: ENumericalColorScaleType.SEQUENTIAL,
    shape: null,
    dragMode: EScatterSelectSettings.RECTANGLE,
    alphaSliderVal: 1,
    sizeSliderVal: 5,
  } as IScatterConfig);
  const columns = React.useMemo(() => (user ? fetchIrisData() : []), [user]);
  const [selectedIndices, setSelectedIndices] = React.useState<number[]>([]);
  const selection = React.useMemo(() => selectedIndices.map((i) => iris[i]), [selectedIndices]);

  const visSelection = React.useMemo(() => selection.map((s) => `${iris.indexOf(s)}`), [selection]);
  const [loading, setLoading] = React.useState(false);
  const lineupRef = React.useRef<DatavisynTaggle>();

  const lineupColumnDescs = lineupRef.current?.data?.getColumns();

  const rowSelection = React.useMemo(() => Object.fromEntries(selectedIndices.map((i) => [i, true])), [selectedIndices]);
  const mrtColumns = React.useMemo<MRT_ColumnDef<(typeof iris)[0]>[]>(
    () =>
      // TODO: Move this function to the mrt package
      (lineupColumnDescs || []).map((c) => ({
        // TODO: Text, Number, Categorical, Date, Boolean, ...
        accessorKey: (c as any).column,
        header: c.label,
        size: c.width,
        enableHiding: true,
        // TODO:
        Filter: ({ column, header, table, rangeFilterIndex }) => 'Filter impl.',
      })),
    [lineupColumnDescs],
  );

  // TODO: Move this package to the mrt/hooks.tsx file
  const table = useMantineReactTable({
    columns: mrtColumns,
    data: iris,
    enablePagination: false,
    enableRowSelection: true,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    enableFilters: true,
    mantinePaperProps: {
      style: {
        flex: 1,
        overflowY: 'auto',
      },
    },
    onRowSelectionChange: (updater) => {
      const newSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
      setSelectedIndices(Object.keys(newSelection).map((i) => +i));
    },
    state: {
      density: 'xs',
      rowSelection,
    },
  });

  return (
    <VisynApp
      header={
        <VisynHeader
          components={{
            aboutAppModal: {
              content: <Text>This is the demo app for visyn core.</Text>,
            },
          }}
        />
      }
    >
      {user ? (
        <SimpleGrid cols={2} style={{ height: '100%' }} ml="md" pt="md">
          <Stack
            style={{
              height: '100%',
              overflowY: 'auto',
            }}
          >
            <Select
              placeholder="Add a score column"
              onChange={async (value) => {
                setLoading(true);
                // eslint-disable-next-line no-promise-executor-return
                await new Promise((resolve) => setTimeout(resolve, 1000));

                const data = await (() => {
                  if (value === 'number') {
                    return MyNumberScore(value);
                  }
                  if (value === 'category') {
                    return MyStringScore(value);
                  }
                  if (value === 'smiles') {
                    return MySMILESScore(value);
                  }
                  throw new Error('Unknown score type');
                })();

                lineupRef.current.createScoreColumn(data);
                setLoading(false);
              }}
              rightSection={loading ? <Loader /> : null}
              data={[
                { value: 'number', label: 'Number' },
                { value: 'category', label: 'Category' },
                { value: 'smiles', label: 'SMILES' },
              ]}
            />

            <VisynRanking
              data={iris}
              selection={selection}
              setSelection={(newSelection, newIndices) => {
                setSelectedIndices(newIndices);
              }}
              getBuilder={({ data }) => defaultBuilder({ data, smilesOptions: { setDynamicHeight: true } })}
              onBuiltLineUp={({ lineup }) => {
                lineupRef.current = lineup;

                autosizeWithSMILESColumn({ provider: lineup.data, lineup });
              }}
            />

            <Divider orientation="horizontal" />

            <MantineReactTable table={table} />
          </Stack>
          <Vis
            columns={columns}
            showSidebarDefault
            externalConfig={visConfig}
            setExternalConfig={setVisConfig}
            selected={visSelection}
            selectionCallback={(s) => {
              if (s) {
                setSelectedIndices(s.map((i) => +i));
              }
            }}
          />
        </SimpleGrid>
      ) : null}
    </VisynApp>
  );
}
