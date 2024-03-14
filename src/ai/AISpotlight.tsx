import { rem, Button, Image, Text, Center, SimpleGrid, Stack, TextInput, Group } from '@mantine/core';
import { Spotlight, SpotlightActionData, spotlight } from '@mantine/spotlight';
import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons/faWandMagicSparkles';
import { initializeAgentExecutorWithOptions, AgentExecutor } from 'langchain/agents';
import { useEffect } from 'react';
import { DynamicTool } from 'langchain/tools';
import { showNotification } from '@mantine/notifications';
import yourAppImage from './YourAppImage.png';
import '@mantine/spotlight/styles.css';
import { useOpenAIModel } from './useOpenAIModel';
import { parseArrayString } from './utils';
import { getAllOnboardingNodes, getOnboardingNodeById } from '../vis/onboarding';
import { apiKey } from '../api_key';

export function AISpotlight() {
  const model = useOpenAIModel(apiKey);

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
            name: 'onboarding_highlight_node',
            func: async (input, runManager) => {
              console.log('Calling onboarding_highlight_node', input, getOnboardingNodeById(input));
              // setSelection(parseArrayString(input));
              return null;
            },
            description: `Highlights all node ids in the onboarding process. Pick one of the following: ${nodes.filter((n) => n.visible).map((n) => `${n.onboardingId}: ${n.label}`)}`,
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
