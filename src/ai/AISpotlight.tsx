import { Button } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { Spotlight, SpotlightActionData, spotlight } from '@mantine/spotlight';
import '@mantine/spotlight/styles.css';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { DynamicTool } from 'langchain/tools';
import * as React from 'react';
import { apiKey } from '../api_key';
import { useOnboardingContext } from '../app/OnboardingContext';
import { getAllOnboardingNodes, getOnboardingNodeById } from '../vis/onboarding';
import { useOpenAIModel } from './useOpenAIModel';

export function AISpotlight() {
  const model = useOpenAIModel(apiKey);
  const { setOnboardingNodeToHighlight } = useOnboardingContext();

  const [output, setOutput] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const actions: SpotlightActionData[] = [
    {
      id: 'begin-onboarding-for-vis',
      label: 'Vis onboarding',
      description: 'Onboard the user on the general vis component',
      onClick: async () => {
        const nodes = getAllOnboardingNodes();

        const tools = [
          new DynamicTool({
            // determine what to hightlight
            name: 'onboarding_find_node',
            func: async (input, runManager) => {
              console.log('Calling onboarding_find_node', input, getOnboardingNodeById(input));
              // setSelection(parseArrayString(input));
              setOnboardingNodeToHighlight?.(input);
              return null;
            },
            description: (() => {
              const filteredNodes = nodes
                .filter((n) => n.visible)
                .filter((n) => /[open|close]-button/g.test(n.onboardingId))
                .map((n) => `${n.onboardingId}: ${n.label}`);
              return `Highlights the settings if the sidebar of the visualization is not open. Pick one of the following: ${filteredNodes}`;
            })(),
          }),
        ];
        console.log(tools);
        const executor = await initializeAgentExecutorWithOptions(tools, model, {
          agentType: 'zero-shot-react-description',
          verbose: true,
        });

        if (executor) {
          try {
            setLoading(true);
            const res = await executor.call({ input: `Onboard me on the vis` });
            setOutput(res?.output || '');
          } catch (e) {
            showNotification({
              title: 'Failed to provide an answer',
              message: JSON.stringify(e.data?.detail || 'Unknown error'),
              color: 'red',
            });
          } finally {
            setLoading(false);
          }
        }
      },
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      description: 'Get full information about current system status',
      onClick: () => console.log('Dashboard'),
    },
    {
      id: 'documentation',
      label: 'Documentation',
      description: 'Visit documentation to lean more about all features',
      onClick: () => console.log('Documentation'),
    },
  ];
  return (
    <>
      <Button color="dvAI" onClick={spotlight.open}>
        Open spotlight
      </Button>
      <Spotlight
        actions={actions}
        nothingFound="Nothing found..."
        highlightQuery
        searchProps={{
          placeholder: 'Search...',
        }}
      />
    </>
  );
}
