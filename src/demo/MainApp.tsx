import * as React from 'react';
import { Menu } from '@mantine/core';
import { Vis, ESupportedPlotlyVis, ENumericalColorScaleType, EScatterSelectSettings, IVisConfig } from '../vis';
import { fetchIrisData } from '../vis/stories/Iris.stories';
import { useVisynAppContext, VisynApp, VisynHeader } from '../app';
import { LoginUtils } from '../security';

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
      {user ? <Vis columns={columns} showSidebarDefault externalConfig={visConfig} setExternalConfig={setVisConfig} /> : null}
    </VisynApp>
  );
}
