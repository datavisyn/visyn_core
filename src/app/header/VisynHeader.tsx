import { Header, Group, Title, useMantineTheme, MantineColor, Text, createStyles, MediaQuery, Space } from '@mantine/core';
import * as React from 'react';
import { useMediaQuery } from '@mantine/hooks';
import { BurgerMenu } from './BurgerMenu';
import { DatavisynLogo } from './DatavisynLogo';
import { UserMenu } from './UserMenu';
import { useVisynAppContext } from '../VisynAppContext';
import { IAboutAppModalConfig } from './AboutAppModal';
import { ConfigurationMenu } from './ConfigurationMenu';

const useStyles = createStyles(() => ({
  a: {
    '& > a': {
      '&:hover': {
        color: 'currentColor',
      },
    },
  },
}));

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
  const { classes } = useStyles();
  const largerThanSm = useMediaQuery('(min-width: 768px)');

  return (
    <Header height={height} style={{ backgroundColor: backgroundColor || '#495057' }} withBorder={false}>
      <Group
        sx={{
          height,
          display: 'flex',
          justifyContent: 'space-between',
        }}
        noWrap
      >
        <Group h="100%" align="center" position="left" noWrap ml={largerThanSm && components?.beforeLeft ? 0 : 'xs'}>
          {largerThanSm && components?.beforeLeft}
          {components?.burgerMenu ? <BurgerMenu menu={components?.burgerMenu} /> : null}
          {components?.title === undefined ? (
            <Title className={classes.a} order={3} weight={100} color={color} truncate>
              <Text>{appName}</Text>
            </Title>
          ) : (
            components?.title
          )}
          {largerThanSm && components?.afterLeft}
        </Group>
        <Group h="100%" align="center" position="center" noWrap>
          {largerThanSm && components?.beforeCenter}
          {largerThanSm && components?.center}
          {largerThanSm && components?.afterCenter}
        </Group>

        <MediaQuery smallerThan="md" styles={{ flexGrow: 1 }}>
          <Group h="100%" align="center" position="right" noWrap>
            {largerThanSm && components?.beforeRight}
            {components?.logo === undefined ? <DatavisynLogo color={backgroundColor === 'white' ? 'black' : 'white'} /> : components?.logo}
            <Group spacing={5}>
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
        </MediaQuery>
      </Group>
    </Header>
  );
}
