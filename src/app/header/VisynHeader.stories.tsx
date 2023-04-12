import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { Menu, Text, createStyles, Group, Button } from '@mantine/core';
import { VisynHeader } from './VisynHeader';
import { VisynAppContext } from '../VisynAppContext';
import { IUser } from '../../security/index';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/Ui/VisynHeader',
  component: VisynHeader,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
} as ComponentMeta<typeof VisynHeader>;

const useStyles = createStyles((theme) => ({
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
}));

const user: IUser = {
  name: 'Jaimy Smith',
  roles: [],
};

const customerLogo = (
  <Text fw={700} color="gray.0">
    Customer
  </Text>
);

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
// eslint-disable-next-line react/function-component-definition
const Template: ComponentStory<typeof VisynHeader> = (args) => {
  const visynAppContextValue = React.useMemo(
    () => ({
      user,
      appName: 'Demo Application',
      clientConfig: {},
    }),
    [],
  );
  return (
    <VisynAppContext.Provider value={visynAppContextValue}>
      <VisynHeader {...args} />
    </VisynAppContext.Provider>
  );
};

export const Basic = Template.bind({}) as typeof Template;
Basic.args = {
  components: {
    aboutAppModal: {
      content: <Text>You can add some custom content to this about app modal. It should provide some meaningful description about the application.</Text>,
    },
  },
};

export const BurgerMenu = Template.bind({}) as typeof Template;
BurgerMenu.args = {
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
};

export const CustomerLogo = Template.bind({}) as typeof Template;
CustomerLogo.args = {
  components: {
    beforeRight: customerLogo,
    aboutAppModal: {
      content: <Text>You can add some custom content to this about app modal. It should provide some meaningful description about the application.</Text>,
      customerLogo,
    },
  },
};

export const ProjectName = Template.bind({}) as typeof Template;
ProjectName.args = {
  components: {
    center: (
      <Text weight={500} size="md" c="white">
        Project A
      </Text>
    ),
    aboutAppModal: {
      content: <Text>You can add some custom content to this about app modal. It should provide some meaningful description about the application.</Text>,
    },
  },
};

function TabGroup() {
  const { classes } = useStyles();
  return (
    <Group h="100%" className={classes.customComponentGroup}>
      <a href="#" className={classes.link}>
        Tab 1
      </a>
      <a href="#" className={classes.link}>
        Tab 2
      </a>
    </Group>
  );
}

export const Tabs = Template.bind({}) as typeof Template;
Tabs.args = {
  components: {
    aboutAppModal: {
      content: <Text>You can add some custom content to this about app modal. It should provide some meaningful description about the application.</Text>,
    },
    afterLeft: <TabGroup />,
  },
};

export const ExtendedUserMenu = Template.bind({}) as typeof Template;
ExtendedUserMenu.args = {
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
};

export const ExtendedConfigurationMenu = Template.bind({}) as typeof Template;
ExtendedConfigurationMenu.args = {
  components: {
    aboutAppModal: {
      content: <Text>You can add some custom content to this about app modal. It should provide some meaningful description about the application.</Text>,
    },
    configurationMenuEntries: (
      <>
        <Menu.Item>Item A</Menu.Item>
        <Menu.Item>Item B</Menu.Item>
        <Menu.Divider />
        <Menu.Item>Item C</Menu.Item>
      </>
    ),
  },
};

export const AllExtensionPoints = Template.bind({}) as typeof Template;
AllExtensionPoints.args = {
  components: {
    title: (
      <Button variant="light" compact radius="lg">
        title
      </Button>
    ),
    afterLeft: (
      <Button variant="light" compact radius="lg">
        afterLeft
      </Button>
    ),
    beforeLeft: (
      <Button variant="light" compact radius="lg">
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
      <Button variant="light" compact radius="lg">
        beforeCenter
      </Button>
    ),
    center: (
      <Button variant="light" compact radius="lg">
        center
      </Button>
    ),
    afterCenter: (
      <Button variant="light" compact radius="lg">
        afterCenter
      </Button>
    ),
    beforeRight: (
      <Button variant="light" compact radius="lg">
        beforeRight
      </Button>
    ),
    afterRight: (
      <Button variant="light" compact radius="lg">
        afterRight
      </Button>
    ),
  },
};
