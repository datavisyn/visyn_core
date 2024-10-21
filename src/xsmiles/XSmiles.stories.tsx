import React from 'react';
import { ComponentStory } from '@storybook/react';
import { Stack, Text } from '@mantine/core';
import type { RDKitModule } from '@rdkit/rdkit';
import { SingleView as SingleView3 } from 'xsmiles';
import SingleView from './modules/SingleView';

const wasmURL = new URL('@rdkit/rdkit/dist/RDKit_minimal.wasm', import.meta.url);

declare global {
  interface Window {
    RDKit: RDKitModule;
  }
}

export async function initRDKit(): Promise<RDKitModule> {
  return (
    import('@rdkit/rdkit')
      // @ts-ignore
      .then((m) => m.default({ locateFile: () => wasmURL.pathname }))
      .then((rdkit) => {
        window.RDKit = rdkit;

        return rdkit;
      })
  );
}

await initRDKit();

function TimeUtil() {
  return (
    <Stack p="xl" gap="xl">
      <SingleView
        gradientConfig={{}}
        molecule={{
          string: 'OCCc1c(C)[n+](cs1)Cc2cnc(C)nc2N',
          method: {
            name: 'method 1',
            scores: [
              0.0154, -0.0155, 0.00199, 0.00147, 0.7825, 0.9472, 0.8076, 0.9898, 0.9165, 0.9723, 0.9433, 0.9547, 0.9975, 1, 1, 1, 0.2531, -0.0341, 0.0462,
              0.1739, -0.1962, -0.0836, 0.4161, -0.9365, -0.9853, -0.9894, -0.9229, -0.0213, 0.934, 0.6666, 0.8192,
            ],
            attributes: {},
          },
          attributes: {},
          substructureHighlight: 'CC',
        }}
        showScoresOnStructure
      />
      <SingleView3
        molecule={{
          string: 'OCCc1c(C)[n+](cs1)Cc2cnc(C)nc2N',
          method: {
            name: 'method 1',
            scores: [
              0.0154, -0.0155, 0.00199, 0.00147, 0.7825, 0.9472, 0.8076, 0.9898, 0.9165, 0.9723, 0.9433, 0.9547, 0.9975, 1, 1, 1, 0.2531, -0.0341, 0.0462,
              0.1739, -0.1962, -0.0836, 0.4161, -0.9365, -0.9853, -0.9894, -0.9229, -0.0213, 0.934, 0.6666, 0.8192,
            ],
            attributes: {},
          },
          attributes: {},
          substructureHighlight: undefined,
        }}
        drawerType="RDKitDrawer"
        hideAttributesTable
        width={200}
        height={200}
      />

    </Stack>
  );
}

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/XSmiles/Basic',
  component: TimeUtil,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
// eslint-disable-next-line react/function-component-definition
const Template: ComponentStory<typeof TimeUtil> = (args) => {
  return <TimeUtil />;
};

export const Basic: typeof Template = Template.bind({});
Basic.args = {
  components: {
    aboutAppModal: {
      content: <Text>You can add some custom content to this about app modal. It should provide some meaningful description about the application.</Text>,
    },
  },
};
