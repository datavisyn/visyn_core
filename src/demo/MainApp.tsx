import * as React from 'react';

import { Loader, Tabs, Text } from '@mantine/core';

import { VisynApp, VisynHeader } from '../app';

const LazyFlameCase1 = React.lazy(() => import('./Cases/FlameCase1'));
const LazyFlameCase2 = React.lazy(() => import('./Cases/FlameCase2'));
const LazyFlameCase3 = React.lazy(() => import('./Cases/FlameCase3'));

export function MainApp() {
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
                Waffle Plot Demo
              </Text>
            ),
          }}
        />
      }
    >
      <Tabs defaultValue="gallery" keepMounted={false} variant="pills">
        <Tabs.List>
          <Tabs.Tab value="gallery">Case Study 1</Tabs.Tab>
          <Tabs.Tab value="messages">Case Study 2</Tabs.Tab>
          <Tabs.Tab value="settings">Case Study 3</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="gallery">
          <React.Suspense fallback={<Loader />}>
            <LazyFlameCase1 />
          </React.Suspense>
        </Tabs.Panel>

        <Tabs.Panel value="messages">
          <React.Suspense fallback={<Loader />}>
            <LazyFlameCase2 />
          </React.Suspense>
        </Tabs.Panel>

        <Tabs.Panel value="settings">
          <React.Suspense fallback={<Loader />}>
            <LazyFlameCase3 />
          </React.Suspense>
        </Tabs.Panel>
      </Tabs>
    </VisynApp>
  );
}
