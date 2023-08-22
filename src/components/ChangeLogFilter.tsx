import { Stack, Checkbox, Group, Menu, Tabs, Button } from '@mantine/core';
import * as React from 'react';
import { DatePickerComponent } from './DatePickerComponent';

function getDatesBetween(startDate: Date, endDate: Date) {
  const currentDate = new Date(startDate.getTime());
  const dates = [];
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
}

export function ChangeLogFilter({
  tags,
  times,
  checkedTags,
  setCheckedTags,
  checkedTimes,
  setCheckedTimes,
  setCheckedExtendedTimes,
}: {
  tags: string[];
  times: Date[];
  checkedTags: { [k: string]: boolean };
  setCheckedTags: React.Dispatch<React.SetStateAction<{ [k: string]: boolean }>>;
  checkedTimes: Map<Date, boolean>;
  setCheckedTimes: React.Dispatch<React.SetStateAction<Map<Date, boolean>>>;
  setCheckedExtendedTimes: React.Dispatch<React.SetStateAction<string>>;
}) {
  const [valueSelected, setValueSelected] = React.useState<[Date | null, Date | null]>([null, null]);

  React.useEffect(() => {
    if (valueSelected[0] && valueSelected[1]) {
      const datesBetween = getDatesBetween(valueSelected[0], valueSelected[1]);
      for (const key of checkedTimes.keys()) {
        datesBetween.includes(key)
          ? setCheckedTimes((prevstate) => new Map(prevstate.set(key, true)))
          : setCheckedTimes((prevstate) => new Map(prevstate.set(key, false)));
      }
    }
  }, [checkedTimes, setCheckedTimes, valueSelected]);
  return (
    <Menu>
      <Menu.Target>
        <Button>Filter by</Button>
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
                  onClick={() => setCheckedTags((prevstate) => ({ ...prevstate, [tag]: !prevstate[tag] }))}
                />
              ))}
            </Stack>
          </Tabs.Panel>
          <Tabs.Panel value="time">
            <DatePickerComponent
              inputDatesArray={times}
              valueSelected={valueSelected}
              setValueSelected={setValueSelected}
              setCheckedExtendedTimes={setCheckedExtendedTimes}
            />
          </Tabs.Panel>
        </Tabs>
      </Menu.Dropdown>
    </Menu>
  );
}
