import * as React from 'react';

import { AppShell, Center, Tabs } from '@mantine/core';

import { HandsOn1 } from './HandsOn1';
import { HandsOn2 } from './HandsOn2';
import { HandsOn3 } from './HandsOn3';

export function MainApp() {
  return (
    <AppShell>
      <AppShell.Main style={{ display: 'flex', flexDirection: 'column' }}>
        <Center style={{ flexGrow: 1 }}>
          <Tabs defaultValue="gallery">
            <Tabs.List>
              <Tabs.Tab value="gallery">HandsOn 1</Tabs.Tab>
              <Tabs.Tab value="messages">HandsOn 2</Tabs.Tab>
              <Tabs.Tab value="settings">HandsOn 3</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="gallery">
              <HandsOn1 />
            </Tabs.Panel>

            <Tabs.Panel value="messages">
              <HandsOn2 />
            </Tabs.Panel>

            <Tabs.Panel value="settings">
              <HandsOn3 />
            </Tabs.Panel>
          </Tabs>
        </Center>
      </AppShell.Main>
    </AppShell>
  );
}
