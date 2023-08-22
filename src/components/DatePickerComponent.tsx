import { Flex, Button, Stack, Group, Divider } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import React from 'react';

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
      <Stack justify="center" spacing="sm" mr="lg">
        <Button compact variant="subtle" size="sm">
          This week
        </Button>
        <Button compact variant="subtle" size="sm">
          Last week
        </Button>
        <Button compact variant="subtle" size="sm">
          This month
        </Button>
        <Button compact variant="subtle" size="sm">
          Last month
        </Button>
        <Button compact variant="subtle" size="sm">
          This year
        </Button>
      </Stack>
      <Divider orientation="vertical" m="xs" />
      <Stack>
        <Group>
          <DatePicker
            defaultDate={new Date()}
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

              return {};
            }}
          />
        </Group>
      </Stack>
    </Flex>
  );
}
