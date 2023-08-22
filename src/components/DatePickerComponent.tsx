import { Flex, Menu, Button, Stack, Indicator } from '@mantine/core';
import { Calendar, DatePicker, DatePickerInput } from '@mantine/dates';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

export function DatePickerComponent({ dates }: { dates: Date[] }) {
  console.log(dates);
  return (
    <Menu>
      <Menu.Target>
        <Button>Filter by date</Button>
      </Menu.Target>
      <Menu.Dropdown w="lg">
        <Flex>
          <Stack justify="flex-start" spacing="sm" mr="lg">
            <Button compact variant="subtle" size="sm">
              this week
            </Button>
            <Button compact variant="subtle" size="sm">
              last week
            </Button>
            <Button compact variant="subtle" size="sm">
              this month
            </Button>
            <Button compact variant="subtle" size="sm">
              last month
            </Button>
            <Button compact variant="subtle" size="sm">
              this year
            </Button>
          </Stack>
          <Stack>
            <Calendar
              renderDay={(date) => {
                const day = date.getDate();
                return (
                  <Indicator size={6} color="red" offset={-2}>
                    <div>{day}</div>
                  </Indicator>
                );
              }}
            />
          </Stack>
        </Flex>
      </Menu.Dropdown>
    </Menu>
  );
}
