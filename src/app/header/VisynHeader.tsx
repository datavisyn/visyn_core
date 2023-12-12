import { Group, MantineColor, Text, Title } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import * as React from 'react';
import { useVisynAppContext } from '../VisynAppContext';
import { IAboutAppModalConfig } from './AboutAppModal';
import { BurgerMenu } from './BurgerMenu';
import { ConfigurationMenu } from './ConfigurationMenu';
import { DatavisynLogo } from './DatavisynLogo';
import { UserMenu } from './UserMenu';

/** TODO: const useStyles = createStyles(() => ({
  a: {
    '& > a': {
      '&:hover': {
        color: 'currentColor',
      },
    },
  },
})); */

const classes = {};

export function VisynHeader({
  color = 'white',
  backgroundColor,
  height = 50,
  components,
}: {
  /**
   * Optional color to be used for the background. If it is part of the mantine colors, it uses the primary shade, otherwise it is interpreted as CSS color.
   */
  backgroundColor?: MantineColor;
  /**
   * Optional color to be used for the text. This must be in contrast with the given `backgroundColor`.
   */
  color?: MantineColor;
  /**
   * Extension components to be rendered within the header.
   */
  height?: number;
  components?: Partial<{
    beforeLeft: JSX.Element;
    burgerMenu: JSX.Element;
    title: JSX.Element;
    afterLeft: JSX.Element;
    beforeCenter: JSX.Element;
    center: JSX.Element;
    afterCenter: JSX.Element;
    beforeRight: JSX.Element;
    logo: JSX.Element;
    userAvatar: JSX.Element;
    userMenu: JSX.Element;
    configurationMenu: JSX.Element;
    afterRight: JSX.Element;
    aboutAppModal: IAboutAppModalConfig;
  }>;
}) {
  const { appName, user } = useVisynAppContext();
  const largerThanSm = useMediaQuery('(min-width: 768px)');
  const smallerThanMd = useMediaQuery('(max-width: 768px)');

  return (
    <Group
      style={{
        height,
        display: 'flex',
        justifyContent: 'space-between',
        backgroundColor: backgroundColor || '#495057',
      }}
      wrap="nowrap"
    >
      <Group h="100%" align="center" justify="left" wrap="nowrap" ml={largerThanSm && components?.beforeLeft ? 0 : 'xs'}>
        {largerThanSm && components?.beforeLeft}
        {components?.burgerMenu ? <BurgerMenu menu={components?.burgerMenu} /> : null}
        {components?.title === undefined ? (
          <Title order={3}>
            <Text truncate c={color}>
              {appName}
            </Text>
          </Title>
        ) : (
          components?.title
        )}
        {largerThanSm && components?.afterLeft}
      </Group>
      <Group h="100%" align="center" justify="center" wrap="nowrap">
        {largerThanSm && components?.beforeCenter}
        {largerThanSm && components?.center}
        {largerThanSm && components?.afterCenter}
      </Group>

      <Group h="100%" align="center" justify="right" wrap="nowrap" style={smallerThanMd ? { flexGrow: 1 } : {}}>
        {largerThanSm && components?.beforeRight}
        {components?.logo === undefined ? <DatavisynLogo color={backgroundColor === 'white' ? 'black' : 'white'} /> : components?.logo}
        <Group gap={5}>
          {components?.userAvatar === undefined ? (
            user ? (
              <UserMenu menu={components?.userMenu} user={user.name} color={backgroundColor} />
            ) : null
          ) : (
            components?.userAvatar
          )}
          <ConfigurationMenu
            dvLogo={components?.logo === undefined ? <DatavisynLogo color="color" /> : components?.logo}
            menu={components?.configurationMenu}
            aboutAppModal={components?.aboutAppModal}
          />
          {largerThanSm && components?.afterRight}
        </Group>
      </Group>
    </Group>
  );
}
