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
  const { setOnboardingNodeToHighlight, isVisSidebarOpen } = useOnboardingContext();

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
            name: 'onboarding_check_settings_sidebar_visibility',
            /**
             * Open the vis sidebar
             * @param input `data-onboarding-id` of the element
             * @param runManager ?
             * @returns null
             */
            func: async (input, runManager) => {
              console.log({
                message: 'Calling onboarding_check_settings_sidebar_visibility',
                input,
                runManager,
                // node: getOnboardingNodeById(input),
              });
              const returnValue = String(!input.includes('open'));
              return returnValue;
            },
            description: (() => {
              const filteredNodes = nodes
                .filter((n) => n.visible)
                // .filter((n) => /[open|close]-button/g.test(n.onboardingId))
                .map((n) => `${n.onboardingId}: ${n.label}`);
              return `Call the tool 'onboarding_check_settings_sidebar_visibility' with input as the data-onboarding-id of the element to check if settings sidebar is open. Available nodes: ${filteredNodes.join(', ')}.`;
            })(),
          }),
          new DynamicTool({
            name: 'onboarding_check_vis_type_selected',
            func: async (input, runManager) => {
              console.log({
                message: 'Calling onboarding_check_vis_type_selected',
                input,
                runManager,
                // node: getOnboardingNodeById(input),
              });
              const returnValue = (getOnboardingNodeById(input as string) as HTMLInputElement).value as string;
              return returnValue;
            },
            description: (() => {
              const filteredNodes = nodes
                .filter((n) => n.visible)
                // .filter((n) => /[open|close]-button/g.test(n.onboardingId))
                .map((n) => `${n.onboardingId}: ${n.label}`);
              return `Call the tool 'onboarding_check_vis_type_selected' with input as the data-onboarding-id of the element to determine the type of visualization currently being viewed. Available nodes: ${filteredNodes.join(', ')}.`;
            })(),
          }),
        ];

        const executor = await initializeAgentExecutorWithOptions(tools, model, {
          agentType: 'zero-shot-react-description',
          verbose: true,
        });

        if (executor) {
          try {
            // setLoading(true);
            // NOTE: @dv-usama-ansari: The input prompt should be very descriptive and precise for the AI to generate the correct output for the onboarding tours.
            // TODO: @dv-usama-ansari: Use the setters in the `useOnboardingContext` to set the different flags for the onboarding tours.
            //  How do we check if a step has been performed so that the AI can suggest the next step?
            const res = await executor.call({
              input: `Onboard the user to get familiarized with the general vis component. Start by checking if the sidebar is open or not. If the sidebar is open check for the visualization type and suggest the user to change it to bar chart. I am using a library to display step-by-step popovers for the tour on the UI so I would need the output as an array of objects having this shape: "{selector: [data-onboarding-id*=input]; content: string}". Please note that the selector would be computed with the inputs provided to the tools you use internally.`,
            });
            // setOutput(res?.output || '');
            // output when the sidebar is opened
            // [{ "selector": "[data-onboarding-id*=onboarding-vis-close-button]", "content": "This is the settings sidebar where you can customize your visualization. Let's start by changing the visualization type." }, { "selector": "[data-onboarding-id*=onboarding-vis-visualization-type-select]", "content": "Currently, a scatter plot is selected. Please change it to a bar chart to better understand the distribution of your data." }]
            // output when the sidebar is closed
            // [{selector: "[data-onboarding-id*=onboarding-vis-open-button]", content: "Please open the settings sidebar to proceed."}]
            console.log('Output:', res?.output);
          } catch (e) {
            showNotification({
              title: 'Failed to provide an answer',
              message: JSON.stringify(e.data?.detail || 'Unknown error'),
              color: 'red',
            });
          } finally {
            // setLoading(false);
          }
        }
      },
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
