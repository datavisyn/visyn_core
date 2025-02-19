import React from 'react';

import { Button, Menu, Text } from '@mantine/core';
import { Meta, StoryObj } from '@storybook/react';

import { IUser } from '../../security/index';
import { VisynAppContext } from '../VisynAppContext';
import { VisynHeader } from './VisynHeader';

const user: IUser = {
  name: 'Jaimy Smith',
  roles: [],
  properties: {},
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
