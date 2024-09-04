import { Avatar, Menu } from '@mantine/core';
import React from 'react';
import { css } from '@emotion/css';
import { LoginUtils } from '../../security';

export function UserMenu({ menu, user, color }: { menu?: JSX.Element; user: string; color?: string }) {
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
          variant="white"
        >
          {/*
            // NOTE: @dv-usama-ansari: We would not need this fix when we upgrade to Mantine v7.11
            //  Extracting initials is a built-in feature in Mantine v7.11: https://mantine.dev/changelog/7-11-0/#avatar-initials
            */}

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
          <Menu.Label data-testid="visyn-user-login-information">Logged in as {user}</Menu.Label>
          {menu ? (
            <>
              {menu}
              <Menu.Divider />
            </>
          ) : null}
          <Menu.Item
            data-testid="visyn-user-logout"
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
