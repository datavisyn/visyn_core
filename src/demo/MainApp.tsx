import { Loader, Select, SimpleGrid, Stack, Text } from '@mantine/core';
import * as React from 'react';
import { VisynApp, VisynHeader, useVisynAppContext } from '../app';
import { VisynRanking } from '../ranking';
import { IBuiltVisynRanking } from '../ranking/EagerVisynRanking';
import { BaseConfig, ENumericalColorScaleType, EScatterSelectSettings, ESupportedPlotlyVis, Vis } from '../vis';
import { fetchIrisData } from '../vis/stories/Iris.stories';
import { iris } from '../vis/stories/irisData';
import { MyNumberScore, MyStringScore } from './scoresUtils';

export function MainApp() {
  const { user } = useVisynAppContext();
  const [visConfig, setVisConfig] = React.useState({
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
  } as BaseConfig);
  const columns = React.useMemo(() => (user ? fetchIrisData() : []), [user]);
  const [selection, setSelection] = React.useState<typeof iris>([]);

  const visSelection = React.useMemo(() => selection.map((s) => `${iris.indexOf(s)}`), [selection]);
  const createScoreColumnFunc = React.useRef<IBuiltVisynRanking['createScoreColumn']>(null);
  const [loading, setLoading] = React.useState(false);

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
                createScoreColumnFunc.current(({ data }) => {
                  return value === 'number' ? MyNumberScore(value) : MyStringScore(value);
                });
                setLoading(false);
              }}
              rightSection={loading ? <Loader /> : null}
              data={[
                { value: 'number', label: 'Number' },
                { value: 'category', label: 'Category' },
              ]}
            />
            <VisynRanking
              data={iris}
              selection={selection}
              setSelection={setSelection}
              onBuiltLineUp={({ createScoreColumn }) => (createScoreColumnFunc.current = createScoreColumn)}
            />
          </Stack>
          <Vis
            columns={columns}
            showSidebarDefault
            externalConfig={visConfig}
            setExternalConfig={setVisConfig}
            selected={visSelection}
            selectionCallback={(s) => {
              if (s) {
                setSelection(s.map((i) => iris[+i]));
              }
            }}
          />
        </SimpleGrid>
      ) : null}
    </VisynApp>
  );
}
