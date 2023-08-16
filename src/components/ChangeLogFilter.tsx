import { Stack, Checkbox, Group, Menu, Tabs, Button, Divider, Radio } from '@mantine/core';
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
  checkedTags: { [k: string]: boolean };
  setCheckedTags: React.Dispatch<React.SetStateAction<{ [k: string]: boolean }>>;
  checkedTimes: { [k: Date]: boolean };
  setCheckedTimes: React.Dispatch<React.SetStateAction<{ [k: string]: boolean }>>;
  checkedExtendedTimes: { [k: string]: boolean };
  setCheckedExtendedTimes: React.Dispatch<React.SetStateAction<{ [k: string]: boolean }>>;
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
                <Button variant="subtle" size="xs" onClick={() => tags.map((k) => setCheckedTags((prevstate) => ({ ...prevstate, [k]: true })))}>
                  Select all
                </Button>
                <Button variant="subtle" size="xs" onClick={() => tags.map((k) => setCheckedTags((prevstate) => ({ ...prevstate, [k]: false })))}>
                  Reset
                </Button>
              </Group>
              {tags.map((tag) => (
                <Checkbox
                  key={tag}
                  label={tag}
                  checked={checkedTags[tag]}
                  onClick={() => setCheckedTags((prevstate) => ({ ...prevstate, [tag]: !checkedTags[tag] }))}
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
                    times.map((t) => setCheckedTimes((prevstate) => ({ ...prevstate, [t]: true })));
                    extendedTimes.map((et) => setCheckedExtendedTimes((prevstate) => ({ ...prevstate, [et]: true })));
                  }}
                >
                  Select all
                </Button>
                <Button
                  variant="subtle"
                  size="xs"
                  onClick={() => {
                    times.map((k) => setCheckedTimes((prevstate) => ({ ...prevstate, [k]: false })));
                    extendedTimes.map((et) => setCheckedExtendedTimes((prevstate) => ({ ...prevstate, [et]: false })));
                  }}
                >
                  Reset
                </Button>
              </Group>
              <Stack>
                <Radio.Group>
                  {extendedTimes.map((et) => (
                    <Radio
                      label={et}
                      key={et}
                      checked={checkedExtendedTimes[et]}
                      onClick={() => setCheckedExtendedTimes((prevstate) => ({ ...prevstate, [et]: !checkedExtendedTimes[et] }))}
                    />
                  ))}
                </Radio.Group>
                <Divider />
                {times.map((time) => (
                  <Checkbox
                    key={time.toDateString()}
                    label={`${time.toLocaleString('default', { month: 'long' })} ${time.getFullYear().toString()}`}
                    checked={checkedTimes[time]}
                    onClick={() => setCheckedTimes((prevstate) => ({ ...prevstate, [time]: !checkedTimes[time] }))}
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
