import { Button, Checkbox, Group, Menu, Tabs } from '@mantine/core';
import { Tab } from '@mantine/core/lib/Tabs/Tab/Tab';
import * as React from 'react';

// TODO:
// + Menu

export function ChangeLogFilter() {
  return (
    <div>
      <Menu>
        <Menu.Dropdown>
          <Tabs variant="outline">
            <Tabs.List>
              <Tabs.Tab value="tags">Tags</Tabs.Tab>
              <Tabs.Tab value="time">Time</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="tags">
              <Group>
                <Checkbox value="Devops" />
                <Checkbox value="Feature" />
                <Checkbox value="some tag" />
                <Checkbox value="some tag" />
              </Group>
            </Tabs.Panel>
            <Tabs.Panel value="time">
              <Group>
                <Checkbox value="July 2023" />
                <Checkbox value="June 2023" />
                <Checkbox value="April 2023" />
                <Checkbox value="January 2023" />
              </Group>
            </Tabs.Panel>
          </Tabs>
        </Menu.Dropdown>
      </Menu>
    </div>
  );
}
