import { ActionIcon, Burger, Menu } from '@mantine/core';
import React from 'react';

export function BurgerButton({ menu }: { menu: JSX.Element }) {
  return (
    <Menu shadow="md">
      <Menu.Target>
        <ActionIcon mx="xs" variant="transparent" color="gray.0">
          <Burger opened={false} color="white" />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown mx={10} mt={0}>
        {menu}
      </Menu.Dropdown>
    </Menu>
  );
}
