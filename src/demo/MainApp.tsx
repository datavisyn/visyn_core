import * as React from 'react';
import { Menu, Select, SimpleGrid, Stack } from '@mantine/core';
import { buildCategoricalColumn, buildNumberColumn } from 'lineupjs';
import { Vis, ESupportedPlotlyVis, ENumericalColorScaleType, EScatterSelectSettings, IVisConfig } from '../vis';
import { fetchIrisData } from '../vis/stories/Iris.stories';
import { iris } from '../vis/stories/irisData';
import { useVisynAppContext, VisynApp, VisynHeader } from '../app';
import { LoginUtils } from '../security';
import { VisynRanking } from '../ranking';
import { IBuiltVisynRanking } from '../ranking/EagerVisynRanking';
import { IScoreResult } from '../ranking/score';

async function MyStringScore(value: string): Promise<IScoreResult> {
  const data = new Array(5000).fill(0).map(() => (Math.random() * 10).toFixed(0));

  return {
    data,
    builder: buildCategoricalColumn('').label(value),
  };
}

async function MyNumberScore(value: string): Promise<IScoreResult> {
  const data = new Array(5000).fill(0).map(() => Math.random() * 100);

  return {
    data,
    builder: buildNumberColumn('').label(value),
  };
}

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
  const createScoreColumnFunc = React.useRef<IBuiltVisynRanking['createScoreColumn']>(null);
  const [loading, setLoading] = React.useState(false);

  return (
    <VisynApp
      header={
        <VisynHeader
          components={{
            userMenu: user ? (
              <>
                <Menu.Label>Logged in as {user.name}</Menu.Label>
                <Menu.Item
                  onClick={() => {
                    LoginUtils.logout();
                  }}
                >
                  Logout
                </Menu.Item>
              </>
            ) : null,
          }}
          backgroundColor="dark"
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
              rightSection={loading ? <i className="fas fa-spinner" /> : undefined}
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
              setSelection(s.map((i) => iris[+i]));
            }}
          />
        </SimpleGrid>
      ) : null}
    </VisynApp>
  );
}
