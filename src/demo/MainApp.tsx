import * as React from 'react';
import { Loader, Select, SimpleGrid, Stack, Text } from '@mantine/core';
import { Vis, ESupportedPlotlyVis, ENumericalColorScaleType, EScatterSelectSettings, IVisConfig } from '../vis';
import { fetchIrisData } from '../vis/stories/Iris.stories';
import { iris } from '../vis/stories/irisData';
import { useVisynAppContext, VisynApp, VisynHeader } from '../app';
import { VisynRanking } from '../ranking';
import { IBuiltVisynRanking } from '../ranking/EagerVisynRanking';
import { MyNumberScore, MyStringScore } from './scoresUtils';
import { CorrelationMatrix } from '../vis/correlation/CorrelationMatrix';

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
            aboutAppModal: {
              content: <Text>This is the demo app for visyn core.</Text>,
            },
          }}
        />
      }
    >
    </VisynApp>
  );
}
