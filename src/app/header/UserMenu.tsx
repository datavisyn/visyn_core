import { Avatar, Menu } from '@mantine/core';
import React from 'react';
import { css } from '@emotion/css';
import { LoginUtils } from '../../security';

export function UserMenu({ menu, user, color }: { menu: JSX.Element; user: string; color: string }) {
  return (
    <Menu shadow="md" data-testid="visyn-user-avatar">
      <Menu.Target>
        <Avatar
          className={css`
            cursor: pointer;
            > div {
              font-size: 12.5px;
            }
          `}
          role="button"
          color={color}
          radius="xl"
          size={28}
        >
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
