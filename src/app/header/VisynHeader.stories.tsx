import { Button, Menu, Text } from '@mantine/core';
import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { IUser } from '../../security/index';
import { VisynAppContext } from '../VisynAppContext';
import { VisynHeader } from './VisynHeader';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
// export default {
//   title: 'Example/Ui/VisynHeader',
//   component: VisynHeader,
//   // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
// };

/** TODO: const useStyles = createStyles((theme) => ({
  customComponentGroup: {
    gap: 0,
    '> a': {
      color: theme.white,
      '&:hover': {
        color: theme.colors.dark[6],
      },
    },
  },
  button: {
    color: theme.white,
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: theme.colors.gray[6],
    },
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
    textDecoration: 'none',
    color: theme.colorScheme === 'dark' ? theme.white : theme.black,
    fontWeight: 500,
    fontSize: theme.fontSizes.sm,

    [theme.fn.smallerThan('sm')]: {
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      width: '100%',
    },

    ...theme.fn.hover({
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
    }),
  },
  hiddenMobile: {
    [theme.fn.smallerThan('sm')]: {
      display: 'none',
    },
  },
})); */

const user: IUser = {
  name: 'Jaimy Smith',
  roles: [],
};

const customerLogo = (
  <Text fw={700} color="gray.0">
    Customer
  </Text>
);

const meta: Meta<typeof VisynHeader> = {
  component: VisynHeader,
  title: 'Components/VisynHeader',
  args: {
    components: {
      aboutAppModal: {
        content: <Text>You can add some custom content to this about app modal. It should provide some meaningful description about the application.</Text>,
      },
    },
  },
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const visynAppContextValue = React.useMemo(
      () => ({
        user,
        appName: 'Demo Application',
        clientConfig: {
          env: 'development' as const,
        },
      }),
      [],
    );
    return (
      <VisynAppContext.Provider value={visynAppContextValue}>
        <VisynHeader {...args} />
      </VisynAppContext.Provider>
    );
  },
};
export default meta;
type Story = StoryObj<typeof VisynHeader>;

export const Basic: Story = {
  args: {
    components: {
      aboutAppModal: {
        content: <Text>You can add some custom content to this about app modal. It should provide some meaningful description about the application.</Text>,
      },
    },
  },
};

export const BurgerMenu: Story = {
  args: {
    components: {
      aboutAppModal: {
        content: <Text>You can add some custom content to this about app modal. It should provide some meaningful description about the application.</Text>,
      },
      burgerMenu: (
        <>
          <Menu.Item>Item A</Menu.Item>
          <Menu.Item>Item B</Menu.Item>
          <Menu.Divider />
          <Menu.Item>Item C</Menu.Item>
        </>
      ),
    },
  },
};

export const CustomerLogo: Story = {
  args: {
    components: {
      beforeRight: customerLogo,
      aboutAppModal: {
        content: <Text>You can add some custom content to this about app modal. It should provide some meaningful description about the application.</Text>,
        customerLogo,
      },
    },
  },
};

export const ProjectName: Story = {
  args: {
    components: {
      center: (
        <Text fw={500} size="md" c="white">
          Project A
        </Text>
      ),
      aboutAppModal: {
        content: <Text>You can add some custom content to this about app modal. It should provide some meaningful description about the application.</Text>,
      },
    },
  },
};

function TabGroup() {
  // const { classes } = useStyles();
  /** return (
    <Group h="100%" className={classes.customComponentGroup}>
      <a href="#" className={classes.link}>
        Tab 1
      </a>
      <a href="#" className={classes.link}>
        Tab 2
      </a>
    </Group>
  ); */

  return <div />;
}

export const Tabs: Story = {
  args: {
    components: {
      aboutAppModal: {
        content: <Text>You can add some custom content to this about app modal. It should provide some meaningful description about the application.</Text>,
      },
      afterLeft: <TabGroup />,
    },
  },
};

export const ExtendedUserMenu: Story = {
  args: {
    components: {
      userMenu: (
        <>
          <Menu.Item>Page A</Menu.Item>
          <Menu.Item>Page B</Menu.Item>
          <Menu.Divider />
          <Menu.Item>Page C</Menu.Item>
        </>
      ),
    },
  },
};

export const ExtendedConfigurationMenu: Story = {
  args: {
    components: {
      aboutAppModal: {
        content: <Text>You can add some custom content to this about app modal. It should provide some meaningful description about the application.</Text>,
      },
      configurationMenu: (
        <>
          <Menu.Item>Item A</Menu.Item>
          <Menu.Item>Item B</Menu.Item>
          <Menu.Divider />
          <Menu.Item>Item C</Menu.Item>
        </>
      ),
    },
  },
};

export const AllExtensionPoints: Story = {
  args: {
    components: {
      title: (
        <Button variant="light" size="compact-sm" radius="lg">
          title
        </Button>
      ),
      afterLeft: (
        <Button variant="light" size="compact-sm" radius="lg">
          afterLeft
        </Button>
      ),
      beforeLeft: (
        <Button variant="light" size="compact-sm" radius="lg">
          beforeLeft
        </Button>
      ),
      burgerMenu: (
        <>
          <Menu.Item>Item A</Menu.Item>
          <Menu.Item>Item B</Menu.Item>
          <Menu.Divider />
          <Menu.Item>Item C</Menu.Item>
        </>
      ),
      beforeCenter: (
        <Button variant="light" size="compact-sm" radius="lg">
          beforeCenter
        </Button>
      ),
      center: (
        <Button variant="light" size="compact-sm" radius="lg">
          center
        </Button>
      ),
      afterCenter: (
        <Button variant="light" size="compact-sm" radius="lg">
          afterCenter
        </Button>
      ),
      beforeRight: (
        <Button variant="light" size="compact-sm" radius="lg">
          beforeRight
        </Button>
      ),
      afterRight: (
        <Button variant="light" size="compact-sm" radius="lg">
          afterRight
        </Button>
      ),
    },
  },
};
