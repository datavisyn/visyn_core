import { Loader, Select, SimpleGrid, Stack, Text } from '@mantine/core';
import * as React from 'react';
import { VisynApp, VisynHeader, useVisynAppContext } from '../app';
import { DatavisynTaggle, VisynRanking, autosizeWithSMILESColumn } from '../ranking';
import { defaultBuilder } from '../ranking/EagerVisynRanking';
import {
  BaseVisConfig,
  EAggregateTypes,
  EBarDirection,
  EBarDisplayType,
  EBarGroupingType,
  EBarSortState,
  ENumericalColorScaleType,
  ESupportedPlotlyVis,
  IBarConfig,
  Vis,
} from '../vis';
import { MyCategoricalScore, MyLinkScore, MyNumberScore, MySMILESScore, MyStringScore } from './scoresUtils';
import { fetchTestData, generateTestData } from '../vis/stories/explodedData';
import { breastCancerData } from '../vis/stories/breastCancerData';
import { fetchBreastCancerData } from '../vis/stories/fetchBreastCancerData';

const testData = generateTestData(1000);

export function MainApp() {
  const { user } = useVisynAppContext();
  const [visConfig, setVisConfig] = React.useState<BaseVisConfig>(
    () =>
      ({
        type: ESupportedPlotlyVis.BAR,
        numColumnsSelected: [],
        catColumnSelected: null,
        // catColumnSelected: {
        //   description: 'First category',
        //   id: 'categorical1',
        //   name: 'Categorical 1',
        // },
        group: null,
        // group: {
        //   description: 'Type 1',
        //   id: 'type1',
        //   name: 'Type 1',
        // },
        groupType: EBarGroupingType.STACK,
        xAxisDomain: EBarDirection.HORIZONTAL ? [0, 1000] : null,
        yAxisDomain: EBarDirection.VERTICAL ? [0, 1000] : null,
        facets: null,
        // facets: {
        //   description: 'some very long description',
        //   id: 'name',
        //   name: 'Name',
        // },
        focusFacetIndex: null,
        display: EBarDisplayType.ABSOLUTE,
        direction: EBarDirection.HORIZONTAL,
        aggregateColumn: null,
        aggregateType: EAggregateTypes.COUNT,
        showFocusFacetSelector: false,
        sortState: {
          x: EBarSortState.NONE,
          y: EBarSortState.NONE,
        },
        numColorScaleType: ENumericalColorScaleType.SEQUENTIAL,
        merged: true,
        useFullHeight: true,
      }) as IBarConfig,
  );
  const columns = React.useMemo(() => (user ? fetchBreastCancerData() : []), [user]);
  const [selection, setSelection] = React.useState<typeof breastCancerData>([]);

  const visSelection = React.useMemo(() => selection.map((s) => `${breastCancerData.indexOf(s)}`), [selection]);
  const [loading, setLoading] = React.useState(false);
  const lineupRef = React.useRef<DatavisynTaggle>();

  return (
    <VisynApp
      header={
        <VisynHeader
          components={{
            aboutAppModal: {
              content: <Text>This is the demo app for visyn core.</Text>,
            },
            center: (
              <Text c="white" size="sm">
                {breastCancerData.length} data points / {selection.length} points selected
              </Text>
            ),
          }}
        />
      }
    >
      {user ? (
        <SimpleGrid cols={2} style={{ height: '100%' }} ml="md" pt="md">
          <Stack>
            <Select
              placeholder="Add a score column"
              onChange={async (value) => {
                setLoading(true);
                // eslint-disable-next-line no-promise-executor-return
                await new Promise((resolve) => setTimeout(resolve, 1000));

                const data = await (() => {
                  if (value === 'string') {
                    return MyStringScore(value);
                  }
                  if (value === 'number') {
                    return MyNumberScore(value);
                  }
                  if (value === 'category') {
                    return MyCategoricalScore(value);
                  }
                  if (value === 'link') {
                    return MyLinkScore(value);
                  }
                  if (value === 'smiles') {
                    return MySMILESScore(value);
                  }
                  throw new Error('Unknown score type');
                })();

                lineupRef.current?.createScoreColumn(data);
                setLoading(false);
              }}
              rightSection={loading ? <Loader /> : null}
              data={[
                { value: 'string', label: 'String' },
                { value: 'number', label: 'Number' },
                { value: 'category', label: 'Category' },
                { value: 'smiles', label: 'SMILES' },
                { value: 'link', label: 'Link' },
              ]}
            />

            <VisynRanking
              data={breastCancerData}
              selection={selection}
              setSelection={setSelection}
              getBuilder={({ data }) => defaultBuilder({ data, smilesOptions: { setDynamicHeight: true } })}
              onBuiltLineUp={({ lineup }) => {
                lineupRef.current = lineup;
                autosizeWithSMILESColumn({ provider: lineup.data, lineup });
              }}
            />
          </Stack>
          <Vis
            columns={columns}
            showSidebarDefault
            externalConfig={visConfig}
            showDownloadScreenshot
            setExternalConfig={setVisConfig}
            selected={visSelection}
            selectionCallback={(s) => {
              if (s) {
                setSelection(s.map((i) => breastCancerData[+i]!));
              }
            }}
            filterCallback={(f) => {
              console.log(f);
            }}
          />
        </SimpleGrid>
      ) : null}
    </VisynApp>
  );
}
