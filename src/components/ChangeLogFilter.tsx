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
}: {
  tags: string[];
  times: Date[];
  checkedTags: string[];
  setCheckedTags: React.Dispatch<React.SetStateAction<string[]>>;
  checkedTimes: Date[];
  setCheckedTimes: React.Dispatch<React.SetStateAction<Date[]>>;
}) {
  const [valueSelected, setValueSelected] = React.useState<[Date | null, Date | null]>([new Date(), new Date()]);

  React.useEffect(() => {
    if (valueSelected[0] && valueSelected[1]) {
      const datesBetween = getDatesBetween(valueSelected[0], valueSelected[1]);
      checkedTimes.forEach((time) =>
        datesBetween.includes(time) ? setCheckedTimes((prevstate) => [...prevstate, time]) : setCheckedTimes(() => checkedTimes.filter((ct) => ct !== time)),
      );
    }
  }, [checkedTimes, setCheckedTimes, valueSelected]);
  return (
    <Menu>
      <Menu.Target>
        <Button>Filter by</Button>
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
                  onClick={() =>
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
