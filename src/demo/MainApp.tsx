import { Loader, Select, SimpleGrid, Stack, Text } from '@mantine/core';
import * as React from 'react';
import { VisynApp, VisynHeader, useVisynAppContext } from '../app';
import { DatavisynTaggle, VisynRanking, autosizeWithSMILESColumn } from '../ranking';
import { defaultBuilder } from '../ranking/EagerVisynRanking';
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
import { fetchIrisData } from '../vis/stories/fetchIrisData';
import { iris } from '../vis/stories/irisData';
import { MyCategoricalScore, MyLinkScore, MyNumberScore, MySMILESScore, MyStringScore } from './scoresUtils';

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
    showLabels: ELabelingOptions.SELECTED,
    regressionLineOptions: {
      type: ERegressionLineType.LINEAR,
      showStats: true,
    },
  } as IScatterConfig);
  const columns = React.useMemo(() => (user ? fetchIrisData() : []), [user]);
  const [selection, setSelection] = React.useState<typeof iris>([]);

  const visSelection = React.useMemo(() => selection.map((s) => `${iris.indexOf(s)}`), [selection]);
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

                lineupRef.current.createScoreColumn(data);
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
              if (s) {
                setSelection(s.map((i) => iris[+i]));
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
