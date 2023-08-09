import { Stack, Checkbox, Group, Menu, Tabs, Button } from '@mantine/core';
import * as React from 'react';

export function ChangeLogFilter({
  tags,
  times,
  checkedTags,
  setCheckedTags,
  checkedTimes,
  setCheckedTimes,
}: {
  tags: string[];
  times: Date[];
  checkedTags: Map<string, boolean>;
  setCheckedTags: React.Dispatch<React.SetStateAction<Map<string, boolean>>>;
  checkedTimes: Map<Date, boolean>;
  setCheckedTimes: React.Dispatch<React.SetStateAction<Map<Date, boolean>>>;
}) {
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
                <Button variant="subtle" size="xs" onClick={() => tags.map((k) => setCheckedTags((prevstate) => new Map(prevstate.set(k, true))))}>
                  Select all
                </Button>
                <Button variant="subtle" size="xs" onClick={() => tags.map((k) => setCheckedTags((prevstate) => new Map(prevstate.set(k, false))))}>
                  Reset
                </Button>
              </Group>
              {tags.map((tag) => (
                <Checkbox
                  key={tag}
                  label={tag}
                  checked={checkedTags.get(tag)}
                  onClick={() => setCheckedTags((prevstate) => new Map(prevstate.set(tag, !prevstate.get(tag))))}
                />
              ))}
            </Stack>
          </Tabs.Panel>
          <Tabs.Panel value="time">
            <Stack mt="xs">
              <Group>
                <Button variant="subtle" size="xs" onClick={() => times.map((k) => setCheckedTimes((prevstate) => new Map(prevstate.set(k, true))))}>
                  Select all
                </Button>
                <Button variant="subtle" size="xs" onClick={() => times.map((k) => setCheckedTimes((prevstate) => new Map(prevstate.set(k, false))))}>
                  Reset
                </Button>
              </Group>
              {times.map((time) => (
                <Checkbox
                  key={`${time}Key`}
                  label={`${time.toLocaleString('default', { month: 'long' })} ${time.getFullYear().toString()}`}
                  checked={checkedTimes.get(time)}
                  onClick={() => setCheckedTimes((prevstate) => new Map(prevstate.set(time, !prevstate.get(time))))}
                />
              ))}
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Menu.Dropdown>
    </Menu>
  );
}
