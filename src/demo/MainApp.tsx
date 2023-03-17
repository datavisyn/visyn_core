import * as React from 'react';
import { Menu, SimpleGrid } from '@mantine/core';
import { Vis, ESupportedPlotlyVis, ENumericalColorScaleType, EScatterSelectSettings, IVisConfig } from '../vis';
import { fetchIrisData } from '../vis/stories/Iris.stories';
import { iris } from '../vis/stories/irisData';
import { useVisynAppContext, VisynApp, VisynHeader } from '../app';
import { LoginUtils } from '../security';
import { VisynRanking } from '../ranking';

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
        <SimpleGrid cols={2} style={{ height: '100%' }}>
          <VisynRanking data={iris} selection={selection} setSelection={setSelection} />
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
