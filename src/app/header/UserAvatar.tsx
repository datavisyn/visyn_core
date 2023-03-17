import { Avatar, createStyles, Menu } from '@mantine/core';
import React from 'react';
import { LoginUtils } from '../../security';

export function UserAvatar({ menu, user, color }: { menu: JSX.Element; user: string; color: string }) {
  const useStyles = createStyles(() => ({
    avatar: {
      cursor: 'pointer',
    },
  }));

  const { classes } = useStyles();

  return (
    <Menu shadow="md" data-testid="visyn-user-avatar">
      <Menu.Target>
        <Avatar className={classes.avatar} role="button" color={color} radius="xl" size={35}>
          {user
            .split(' ')
            .map((name) => name[0])
            .slice(0, 3)
            .join('')
            .toUpperCase()}
        </Avatar>
      </Menu.Target>

      <Menu.Dropdown>
        <>
          <Menu.Label>Logged in as {user}</Menu.Label>
          <Menu.Divider />
          {menu ? (
            <>
              {menu}
              <Menu.Divider />
            </>
          ) : null}
          <Menu.Item
            onClick={() => {
              LoginUtils.logout();
            }}
          >
            Logout
          </Menu.Item>
        </>
      </Menu.Dropdown>
    </Menu>
  );
}
