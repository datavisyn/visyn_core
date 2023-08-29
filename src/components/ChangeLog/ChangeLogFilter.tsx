import { Stack, Checkbox, Group, Menu, Tabs, Button } from '@mantine/core';
import * as React from 'react';
import { DatePickerComponent } from './DatePickerComponent';

export function ChangeLogFilter({
  tags,
  times,
  checkedTags,
  setCheckedTags,
  valueSelected,
  setValueSelected,
}: {
  tags: string[];
  times: Date[];
  checkedTags: string[];
  setCheckedTags: React.Dispatch<React.SetStateAction<string[]>>;
  valueSelected: [Date, Date];
  setValueSelected: React.Dispatch<React.SetStateAction<[Date, Date]>>;
}) {
  return (
    <Menu>
      <Menu.Target>
        <Button sx={(theme) => ({ backgroundColor: theme.colors[theme.primaryColor][6] })}>Filter by</Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Tabs variant="outline" defaultValue="tags">
          <Tabs.List position="right">
            <Tabs.Tab value="tags">Tags</Tabs.Tab>
            <Tabs.Tab value="time">Date</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="tags">
            <Stack mt="xs">
              <Group>
                <Button variant="subtle" size="xs" onClick={() => setCheckedTags(tags)}>
                  Select all
                </Button>
                <Button variant="subtle" size="xs" onClick={() => setCheckedTags([])}>
                  Reset
                </Button>
              </Group>
              {tags.map((tag) => (
                <Checkbox
                  key={tag}
                  label={tag}
                  checked={checkedTags.includes(tag)}
                  onChange={() =>
                    checkedTags.includes(tag)
                      ? setCheckedTags(() => checkedTags.filter((ct) => ct !== tag))
                      : setCheckedTags((prevstate) => [...prevstate, tag])
                  }
                />
              ))}
            </Stack>
          </Tabs.Panel>
          <Tabs.Panel value="time">
            <DatePickerComponent inputDatesArray={times} valueSelected={valueSelected} setValueSelected={setValueSelected} />
          </Tabs.Panel>
        </Tabs>
      </Menu.Dropdown>
    </Menu>
  );
}
