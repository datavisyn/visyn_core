import { Flex, Menu, Button, Stack, Group } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import React from 'react';

export function DatePickerComponent({ inputDate }: { inputDate: Date }) {
  const [valueSelected, setValueSelected] = React.useState<[Date | null, Date | null]>([null, null]);
  return (
    <Menu>
      <Menu.Target>
        <Button>Filter by date</Button>
      </Menu.Target>
      <Menu.Dropdown w="lg">
        <Flex>
          <Stack justify="flex-start" spacing="sm" mr="lg">
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
                  if (date.getDay() === inputDate.getDay() && date.getDate() === inputDate.getDate()) {
                    return {
                      sx: (theme) => ({
                        backgroundColor: theme.colors.red[theme.fn.primaryShade()],
                        color: theme.white,
                        ...theme.fn.hover({ backgroundColor: theme.colors.red[7] }),
                      }),
                    };
                  }

                  return {};
                }}
                getYearControlProps={(date) => {
                  if (date.getFullYear() === new Date().getFullYear()) {
                    return {
                      sx: (theme) => ({
                        color: theme.fn.primaryColor(),
                        fontWeight: 700,
                      }),
                    };
                  }

                  if (date.getFullYear() === new Date().getFullYear() + 1) {
                    return { disabled: true };
                  }

                  return {};
                }}
                // getMonthControlProps={(date) => {
                //   if (date.getMonth() === 1) {
                //     return {
                //       sx: (theme) => ({
                //         color: theme.fn.primaryColor(),
                //         fontWeight: 700,
                //       }),
                //     };
                //   }

                //   return {};
                // }}
              />
            </Group>
          </Stack>
        </Flex>
      </Menu.Dropdown>
    </Menu>
  );
}
