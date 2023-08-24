import { Flex, Button, Stack, Group, Divider, Text } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import React from 'react';

function DateThisWeek(date: Date) {
  const dayOfThisWeek = date.getDate() - 7;
  console.log(date.getDate());
  console.log(dayOfThisWeek);
  if (dayOfThisWeek > 0) {
    return new Date(date.getFullYear(), date.getMonth(), dayOfThisWeek);
  }
  if (date.getMonth() - 1 > 0) {
    return new Date(date.getFullYear(), date.getMonth() - 1, new Date(date.getFullYear(), date.getMonth(), 0).getDate() - dayOfThisWeek);
  }
  return new Date(date.getFullYear() - 1, 11, dayOfThisWeek);
}

function DateThisMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function DateLastMonthFD(date: Date) {
  const lastMonth = date.getMonth() - 1;
  if (lastMonth > 0) {
    return new Date(date.getFullYear(), lastMonth, 1);
  }
  return new Date(date.getFullYear() - 1, 11, 1);
}
function DateLastMonthLD(date: Date) {
  const lastMonth = date.getMonth() - 1;
  if (lastMonth > 0) {
    return new Date(date.getFullYear(), lastMonth, new Date(date.getFullYear(), date.getMonth(), 0).getDate());
  }
  return new Date(date.getFullYear() - 1, 11, new Date(date.getFullYear(), date.getMonth(), 0).getDate());
}
function DateThisYear(date: Date) {
  return new Date(date.getFullYear(), 0, 1);
}

export function DatePickerComponent({
  inputDatesArray,
  valueSelected,
  setValueSelected,
}: {
  inputDatesArray: Date[];
  valueSelected: [Date, Date];
  setValueSelected: React.Dispatch<React.SetStateAction<[Date, Date]>>;
}) {
  const days = inputDatesArray.map((date) => date.getDay());
  const dates = inputDatesArray.map((date) => date.getDate());
  const months = inputDatesArray.map((date) => date.getMonth());
  const years = inputDatesArray.map((date) => date.getFullYear());

  return (
    <Flex>
      <Stack align="start" spacing="sm" mr="lg" mt="lg">
        <Button
          compact
          variant="subtle"
          sx={(theme) => ({ color: theme.colors[theme.primaryColor][6] })}
          onClick={() => setValueSelected(() => [new Date(), new Date()])}
        >
          Today
        </Button>
        <Button
          sx={(theme) => ({ color: theme.colors[theme.primaryColor][6] })}
          compact
          variant="subtle"
          ta="left"
          onClick={() => setValueSelected(() => [DateThisWeek(new Date()), new Date()])}
        >
          This week
        </Button>
        <Button
          sx={(theme) => ({ color: theme.colors[theme.primaryColor][6] })}
          compact
          variant="subtle"
          ta="left"
          onClick={() => setValueSelected(() => [DateThisWeek(DateThisWeek(new Date())), DateThisWeek(new Date())])}
        >
          Last week
        </Button>
        <Button
          sx={(theme) => ({ color: theme.colors[theme.primaryColor][6] })}
          compact
          variant="subtle"
          ta="left"
          onClick={() => setValueSelected(() => [DateThisMonth(new Date()), new Date()])}
        >
          This month
        </Button>
        <Button
          sx={(theme) => ({ color: theme.colors[theme.primaryColor][6] })}
          compact
          variant="subtle"
          ta="left"
          onClick={() => setValueSelected(() => [DateLastMonthFD(new Date()), DateLastMonthLD(new Date())])}
        >
          Last month
        </Button>
        <Button
          sx={(theme) => ({ color: theme.colors[theme.primaryColor][6] })}
          compact
          variant="subtle"
          ta="left"
          onClick={() => setValueSelected(() => [DateThisYear(new Date()), new Date()])}
        >
          This year
        </Button>
      </Stack>
      <Divider orientation="vertical" m="xs" />
      <Stack>
        <Group>
          <DatePicker
            defaultDate={valueSelected[1]}
            type="range"
            allowSingleDateInRange
            numberOfColumns={2}
            value={valueSelected}
            onChange={setValueSelected}
            getDayProps={(date) => {
              if (days.includes(date.getDay()) && dates.includes(date.getDate()) && months.includes(date.getMonth()) && years.includes(date.getFullYear())) {
                return {
                  sx: (theme) => ({
                    backgroundColor: theme.colors.gray[3],
                    ...theme.fn.hover({ backgroundColor: theme.colors.gray[4] }),
                  }),
                };
              }

              return { sx: (theme) => ({ '&[data-weekend]': { color: theme.black } }) };
            }}
          />
        </Group>
      </Stack>
    </Flex>
  );
}
