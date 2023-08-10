import { Loader, Select, SimpleGrid, Stack, Text } from '@mantine/core';
import * as React from 'react';
import { VisynApp, VisynHeader, useVisynAppContext } from '../app';
import { VisynRanking, autosizeWithSMILESColumn } from '../ranking';
import { defaultBuilder } from '../ranking/EagerVisynRanking';
import { DatavisynTaggle } from '../ranking/overrides';
import { ENumericalColorScaleType, EScatterSelectSettings, ESupportedPlotlyVis, IVisConfig, Vis } from '../vis';
import { fetchIrisData } from '../vis/stories/Iris.stories';
import { iris } from '../vis/stories/irisData';
import { MyNumberScore, MySMILESScore, MyStringScore } from './scoresUtils';

export function MainApp() {
  const { user } = useVisynAppContext();
  const [visConfig, setVisConfig] = React.useState<IVisConfig>({
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
  });
  const columns = React.useMemo(() => (user ? fetchIrisData() : []), [user]);
  const [selection, setSelection] = React.useState<typeof iris>([]);

  const visSelection = React.useMemo(() => selection.map((s) => `${iris.indexOf(s)}`), [selection]);
  const [loading, setLoading] = React.useState(false);
  const lineupRef = React.useRef<DatavisynTaggle>();

  const [rankingDump, setRankingDump] = React.useState('');
  const [dump, setDump] = React.useState('');

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
          <Stack>
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
            setExternalConfig={setVisConfig}
            selected={visSelection}
            selectionCallback={(s) => {
              setSelection(s.map((i) => iris[+i]));
            }}
          />
        </SimpleGrid>
      ) : null}
    </VisynApp>
  );
}
