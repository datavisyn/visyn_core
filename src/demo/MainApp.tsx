import * as React from 'react';

import { Box, Loader, Select, SimpleGrid, Stack, Text } from '@mantine/core';

import { VisynApp, VisynHeader } from '../app';
import type { DatavisynTaggle } from '../ranking';
import { VisynRanking } from '../ranking/VisynRanking';
import {
  BaseVisConfig,
  ELabelingOptions,
  ENumericalColorScaleType,
  ERegressionLineType,
  EScatterSelectSettings,
  ESupportedPlotlyVis,
  IScatterConfig,
  Vis,
} from '../vis';
import { MyCategoricalScore, MyLinkScore, MyNumberScore, MySMILESScore, MyStringScore } from './scoresUtils';
import { useVisynUser } from '../hooks';
import { Example } from './Example';
import { Example2 } from './Example2';

const { breastCancerData } = await import('../vis/stories/breastCancerData');
const { fetchBreastCancerData } = await import('../vis/stories/fetchBreastCancerData');

export function MainApp() {
  const user = useVisynUser();
  const [visConfig, setVisConfig] = React.useState<BaseVisConfig>({
    type: ESupportedPlotlyVis.SCATTER,
    numColumnsSelected: [
      {
        description: 'Gene expression',
        id: 'stat2GeneExpression',
        name: 'STAT2',
      },
      {
        description: 'Gene expression',
        id: 'brca1GeneExpression',
        name: 'BRCA1',
      },
    ],
    color: {
      description: '',
      id: 'cellularity',
      name: 'Cellularity',
    },
    numColorScaleType: ENumericalColorScaleType.SEQUENTIAL,
    facets: null,
    shape: null,
    dragMode: EScatterSelectSettings.RECTANGLE,
    alphaSliderVal: 1,
    showLabels: ELabelingOptions.SELECTED,
    showLabelLimit: 20,
    regressionLineOptions: {
      type: ERegressionLineType.LINEAR,
      showStats: true,
    },
  } as IScatterConfig);
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
        <Box w={300} h={600} p="lg">
          <Example />

          <Example2 />
        </Box>
      ) : null}
    </VisynApp>
  );
}
