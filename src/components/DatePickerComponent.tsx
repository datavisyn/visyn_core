import { Flex, Menu, Button, Stack } from '@mantine/core';
import { DatePicker, DatePickerInput } from '@mantine/dates';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

export function DatePickerComponent() {
  return (
    <Menu>
      <Menu.Target>
        <Button>Filter by date</Button>
      </Menu.Target>
      <Menu.Dropdown w="lg">
        <Flex>
          <Stack justify="flex-start" spacing="xs">
            <Button variant="subtile">this week</Button>
            <Button variant="subtile">last week</Button>
            <Button variant="subtile">this month</Button>
            <Button variant="subtile">last month</Button>
            <Button variant="subtile">this year</Button>
          </Stack>
          <Stack>
            <DatePickerInput type="range" placeholder="Pick a date" icon={<FontAwesomeIcon style={{ zIndex: 9999 }} color="darkgray" icon={faCalendar} />} />
          </Stack>
        </Flex>
      </Menu.Dropdown>
    </Menu>
  );
}
