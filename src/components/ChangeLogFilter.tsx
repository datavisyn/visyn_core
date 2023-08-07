import { Stack, Checkbox, Group, Menu, Tabs, Button, Flex } from '@mantine/core';
import * as React from 'react';

// TODO:
// + Menu

export function ChangeLogFilter() {
  return (
    <Menu>
      <Menu.Target>
        <Button>filter by</Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Tabs variant="outline" defaultValue="tags">
          <Tabs.List>
            <Tabs.Tab value="tags">Tags</Tabs.Tab>
            <Tabs.Tab value="time">Time</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="tags">
            <Stack mt="xs">
              <Group>
                <Button variant="subtle" size="xs">
                  Select all
                </Button>
                <Button variant="subtle" size="xs">
                  Reset
                </Button>
              </Group>
              <Checkbox label="Devops" />
              <Checkbox label="Feature" />
              <Checkbox label="some tag" />
              <Checkbox label="some tag" />
            </Stack>
          </Tabs.Panel>
          <Tabs.Panel value="time">
            <Stack mt="xs">
              <Group>
                <Button variant="subtle" size="xs">
                  Select all
                </Button>
                <Button variant="subtle" size="xs">
                  Reset
                </Button>
              </Group>
              <Checkbox label="July 2023" />
              <Checkbox label="June 2023" />
              <Checkbox label="April 2023" />
              <Checkbox label="January 2023" />
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Menu.Dropdown>
    </Menu>
  );
}
