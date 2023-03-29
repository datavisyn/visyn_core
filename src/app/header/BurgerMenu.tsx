import { Burger, Menu } from '@mantine/core';
import React from 'react';

export function BurgerMenu({ menu }: { menu: JSX.Element }) {
  const [opened, setOpened] = React.useState(false);
  return (
    <Menu shadow="md" opened={opened}>
      <Menu.Target>
        <Burger onClick={() => setOpened(!opened)} opened={opened} color="#F8F9FA" size="sm" />
      </Menu.Target>

      <Menu.Dropdown mt={0}>{menu}</Menu.Dropdown>
    </Menu>
  );
}
