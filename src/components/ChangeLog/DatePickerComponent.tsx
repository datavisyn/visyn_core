import { Flex, Button, Stack, Group, Divider, Indicator } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import React from 'react';

function DateThisWeek(date: Date) {
  const dayOfThisWeek = date.getDate() - 7;
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
  const [initialDate, setInitialDate] = React.useState(new Date());

  const handleChange = (val: [Date | null, Date | null]) => {
    if (val[0] !== null && val[1] !== null) {
      setInitialDate(new Date(val[1].getFullYear(), val[1].getMonth(), 1));
    }
  };

  return (
    <Flex>
      <Stack align="start" spacing="sm" mr="lg" mt="lg" mb="lg">
        <Button
          compact
          variant="subtle"
          sx={(theme) => ({ color: theme.colors[theme.primaryColor][6] })}
          onClick={() => {
            setValueSelected(() => [null, null]);
            handleChange([new Date(), new Date()]);
          }}
        >
          Reset
        </Button>
        <Divider orientation="horizontal" w="100%" />
        <Button
          compact
          variant="subtle"
          sx={(theme) => ({ color: theme.colors[theme.primaryColor][6] })}
          onClick={() => {
            setValueSelected(() => [new Date(), new Date()]);
            handleChange([new Date(), new Date()]);
          }}
        >
          Today
        </Button>
        <Button
          sx={(theme) => ({ color: theme.colors[theme.primaryColor][6] })}
          compact
          variant="subtle"
          ta="left"
          onClick={() => {
            setValueSelected(() => [DateThisWeek(new Date()), new Date()]);
            handleChange([DateThisWeek(new Date()), new Date()]);
          }}
        >
          This week
        </Button>
        <Button
          sx={(theme) => ({ color: theme.colors[theme.primaryColor][6] })}
          compact
          variant="subtle"
          ta="left"
          onClick={() => {
            setValueSelected(() => [DateThisWeek(DateThisWeek(new Date())), DateThisWeek(new Date())]);
            handleChange([DateThisWeek(DateThisWeek(new Date())), DateThisWeek(new Date())]);
          }}
        >
          Last week
        </Button>
        <Button
          sx={(theme) => ({ color: theme.colors[theme.primaryColor][6] })}
          compact
          variant="subtle"
          ta="left"
          onClick={() => {
            setValueSelected(() => [DateThisMonth(new Date()), new Date()]);
            handleChange([DateThisMonth(new Date()), new Date()]);
          }}
        >
          This month
        </Button>
        <Button
          sx={(theme) => ({ color: theme.colors[theme.primaryColor][6] })}
          compact
          variant="subtle"
          ta="left"
          onClick={() => {
            setValueSelected(() => [DateLastMonthFD(new Date()), DateLastMonthLD(new Date())]);
            handleChange([DateLastMonthFD(new Date()), DateLastMonthLD(new Date())]);
          }}
        >
          Last month
        </Button>
        <Button
          sx={(theme) => ({ color: theme.colors[theme.primaryColor][6] })}
          compact
          variant="subtle"
          ta="left"
          onClick={() => {
            setValueSelected(() => [DateThisYear(new Date()), new Date()]);
            handleChange([DateThisYear(new Date()), new Date()]);
          }}
        >
          This year
        </Button>
      </Stack>
      <Divider orientation="vertical" m="xs" />
      <Stack>
        <Group>
          <DatePicker
            type="range"
            allowSingleDateInRange
            numberOfColumns={2}
            value={valueSelected}
            onChange={(value) => {
              handleChange(value);
              setValueSelected(value);
            }}
            date={initialDate}
            onDateChange={setInitialDate}
            getDayProps={(date) => {
              if (
                date.getDay() === new Date().getDay() &&
                date.getDate() === new Date().getDate() &&
                date.getMonth() === new Date().getMonth() &&
                date.getFullYear() === new Date().getFullYear()
              ) {
                return {
                  sx: (theme) => ({
                    background: theme.colors[theme.primaryColor][6],
                    borderRadius: '50%',
                    borderWidth: '130px',
                    ':hover': { background: theme.colors[theme.primaryColor][6] },
                    color: theme.white,
                    '&[data-in-range]': { color: theme.black },
                    '&[data-selected]': { color: theme.white },
                  }),
                };
              }

              return { sx: (theme) => ({ '&[data-weekend]': { color: theme.black }, '&[data-selected]': { color: theme.white } }) };
            }}
            renderDay={(date) => {
              return (
                <Indicator
                  size={6}
                  color="red"
                  offset={-5}
                  disabled={
                    !inputDatesArray
                      .map((d) => `${d.getUTCFullYear()}, ${d.getUTCMonth()}, ${d.getUTCDate()}`)
                      .includes(`${date.getUTCFullYear()}, ${date.getUTCMonth()}, ${date.getUTCDate()}`)
                  }
                >
                  <div>{date.getUTCDate()}</div>
                </Indicator>
              );
            }}
          />
        </Group>
      </Stack>
    </Flex>
  );
}
