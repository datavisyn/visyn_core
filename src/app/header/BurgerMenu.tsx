import { Burger, Menu } from '@mantine/core';
import { useClickOutside } from '@mantine/hooks';
import React from 'react';

export function BurgerMenu({ menu }: { menu: JSX.Element }) {
  const [opened, setOpened] = React.useState(false);
  const ref = useClickOutside(() => setOpened(false));
  return (
    <Menu shadow="md" opened={opened}>
      <Menu.Target>
        <Burger onClick={() => setOpened(!opened)} opened={opened} color="#F8F9FA" size="sm" ref={ref} />
      </Menu.Target>

      <Menu.Dropdown>{menu}</Menu.Dropdown>
    </Menu>
  );
}
