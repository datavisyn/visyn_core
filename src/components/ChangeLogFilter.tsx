import { Stack, Checkbox, Group, Menu, Tabs, Button, Divider } from '@mantine/core';
import * as React from 'react';

export function ChangeLogFilter({
  tags,
  times,
  extendedTimes,
  checkedTags,
  setCheckedTags,
  checkedTimes,
  setCheckedTimes,
  checkedExtendedTimes,
  setCheckedExtendedTimes,
}: {
  tags: string[];
  times: Date[];
  extendedTimes: string[];
  checkedTags: Map<string, boolean>;
  setCheckedTags: React.Dispatch<React.SetStateAction<Map<string, boolean>>>;
  checkedTimes: Map<Date, boolean>;
  setCheckedTimes: React.Dispatch<React.SetStateAction<Map<Date, boolean>>>;
  checkedExtendedTimes: Map<string, boolean>;
  setCheckedExtendedTimes: React.Dispatch<React.SetStateAction<Map<string, boolean>>>;
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
            <Tabs.Tab value="time">Date</Tabs.Tab>
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
                <Button
                  variant="subtle"
                  size="xs"
                  onClick={() => {
                    times.map((k) => setCheckedTimes((prevstate) => new Map(prevstate.set(k, true))));
                    extendedTimes.map((et) => setCheckedExtendedTimes((prevstate) => new Map(prevstate.set(et, true))));
                  }}
                >
                  Select all
                </Button>
                <Button
                  variant="subtle"
                  size="xs"
                  onClick={() => {
                    times.map((k) => setCheckedTimes((prevstate) => new Map(prevstate.set(k, false))));
                    extendedTimes.map((et) => setCheckedExtendedTimes((prevstate) => new Map(prevstate.set(et, false))));
                  }}
                >
                  Reset
                </Button>
              </Group>
              <Stack>
                {extendedTimes.map((et) => (
                  <Checkbox
                    label={et}
                    key={et}
                    checked={checkedExtendedTimes.get(et)}
                    onClick={() => setCheckedExtendedTimes((prevstate) => new Map(prevstate.set(et, !prevstate.get(et))))}
                  />
                ))}
                <Divider />
                {times.map((time) => (
                  <Checkbox
                    key={time.toDateString()}
                    label={`${time.toLocaleString('default', { month: 'long' })} ${time.getFullYear().toString()}`}
                    checked={checkedTimes.get(time)}
                    onClick={() => setCheckedTimes((prevstate) => new Map(prevstate.set(time, !prevstate.get(time))))}
                  />
                ))}
              </Stack>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Menu.Dropdown>
    </Menu>
  );
}
