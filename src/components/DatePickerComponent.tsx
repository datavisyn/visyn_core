import { Flex, Button, Stack, Group, Divider } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import React from 'react';

export function DatePickerComponent({
  inputDatesArray,
  valueSelected,
  setValueSelected,
  setCheckedExtendedTimes,
}: {
  inputDatesArray: Date[];
  valueSelected: [Date, Date];
  setValueSelected: React.Dispatch<React.SetStateAction<[Date, Date]>>;
  setCheckedExtendedTimes: React.Dispatch<React.SetStateAction<string>>;
}) {
  const days = inputDatesArray.map((date) => date.getDay());
  const dates = inputDatesArray.map((date) => date.getDate());
  const months = inputDatesArray.map((date) => date.getMonth());
  const years = inputDatesArray.map((date) => date.getFullYear());

  return (
    <Flex>
      <Stack justify="flex-start" spacing="sm" mr="lg" mt="lg">
        <Button compact variant="subtle" size="sm" onClick={() => setCheckedExtendedTimes('This week')}>
          This week
        </Button>
        <Button compact variant="subtle" size="sm" onClick={() => setCheckedExtendedTimes('Last week')}>
          Last week
        </Button>
        <Button compact variant="subtle" size="sm" onClick={() => setCheckedExtendedTimes('This month')}>
          This month
        </Button>
        <Button compact variant="subtle" size="sm" onClick={() => setCheckedExtendedTimes('Last week')}>
          Last month
        </Button>
        <Button compact variant="subtle" size="sm" onClick={() => setCheckedExtendedTimes('This year')}>
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

              if (
                date.getDay() === new Date().getDay() &&
                date.getDate() === new Date().getDate() &&
                date.getMonth() === new Date().getMonth() &&
                date.getFullYear() === new Date().getFullYear()
              ) {
                return {
                  sx: (theme) => ({
                    // verändern auf blaue rahmen
                    backgroundColor: theme.colors.red[theme.fn.primaryShade()],
                    color: theme.white,
                    ...theme.fn.hover({ backgroundColor: theme.colors.red[theme.fn.primaryShade()] }),
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
