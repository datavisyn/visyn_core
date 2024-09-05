import { AppShell, AppShellProps } from '@mantine/core';
import * as React from 'react';
import { JSXElementConstructor, ReactElement } from 'react';
import { useVisynAppContext } from './VisynAppContext';
import { VisynHeader } from './header/VisynHeader';
import { VisynLoginMenu } from './login/VisynLoginMenu';

/**
 *
 * @param header Optional custom header to be passed to the AppShell. If not provided, will use an empty VisynHeader.
 * @param navbar Optional navbar component to be passed to AppShell.
 * @param aside Optional aside component to be passed to AppShell
 * @param footer Optional footer component to be passed to AppShell
 * @param appShellProps Optional props to be passed directly to AppShell
 * @param loginMenu Optional custom login menu. If not passed, will default to the VisynLoginMenu.
 * @param headerHeight Optional height for the header, so that you can properly use 100% inside of your application. Does not set the height of the header, just calculates height elsewhere based on this number
 * @returns
 */
export function VisynApp({
  header = null,
  headerConfig = {},
  navbar = null,
  navbarConfig = null,
  footer = null,
  footerConfig = null,
  appShellProps = null,
  children,
  loginMenu = <VisynLoginMenu watch />,
}: {
  header?: ReactElement<unknown, string | JSXElementConstructor<unknown>> | null;
  headerConfig?: Partial<AppShellProps['header']> | null;
  navbar?: ReactElement<unknown, string | JSXElementConstructor<unknown>> | null;
  navbarConfig?: AppShellProps['navbar'] | null;
  aside?: ReactElement<unknown, string | JSXElementConstructor<unknown>> | null;
  footer?: ReactElement<unknown, string | JSXElementConstructor<unknown>> | null;
  footerConfig?: AppShellProps['footer'] | null;
  appShellProps?: Partial<AppShellProps & React.RefAttributes<HTMLDivElement>> | null;
  loginMenu?: JSX.Element | null;
  children?: React.ReactNode;
}) {
  useVisynAppContext();

  return (
    <AppShell
      styles={{
        // root: { height: '100%' },
        // root: { height: `calc(100% - ${0}px)` },
        // Override the padding as Mantine uses "calc(var(--mantine-aside-width, 0px) + 16px)", not allowing us to fill the full page.
        main: {
          // Height 100% only works with a set height
          height: 0,
        },
      }}
      {...appShellProps}
      navbar={navbarConfig ?? undefined}
      footer={footerConfig ?? undefined}
      header={{ height: 50, ...headerConfig }}
    >
      <AppShell.Navbar>{navbar}</AppShell.Navbar>
      <AppShell.Footer>{footer}</AppShell.Footer>
      <AppShell.Header>{header || <VisynHeader />}</AppShell.Header>
      <AppShell.Main>{children}</AppShell.Main>

      {loginMenu}
    </AppShell>
  );
}
