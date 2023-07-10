import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons/faEllipsisVertical';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon, Menu } from '@mantine/core';
import React from 'react';
import { useVisynAppContext } from '../VisynAppContext';
import { AboutAppModal, IAboutAppModalConfig } from './AboutAppModal';

export function ConfigurationMenu({ menu, dvLogo, aboutAppModal }: { menu: JSX.Element; dvLogo: JSX.Element; aboutAppModal?: IAboutAppModalConfig }) {
  const { appName } = useVisynAppContext();

  const [showAboutModal, setShowAboutModal] = React.useState(false);

  return (
    <>
      <Menu shadow="md" data-testid="visyn-configuration-menu">
        <Menu.Target>
          <ActionIcon variant="transparent" color="gray.0">
            <FontAwesomeIcon icon={faEllipsisVertical} size="lg" />
          </ActionIcon>
        </Menu.Target>

        <Menu.Dropdown>
          {menu ? (
            <>
              {menu}
              <Menu.Divider />
            </>
          ) : null}
          <Menu.Label>About</Menu.Label>
          <Menu.Item onClick={() => setShowAboutModal(true)}>About {appName}</Menu.Item>
        </Menu.Dropdown>
      </Menu>
      <AboutAppModal
        opened={showAboutModal}
        onClose={() => setShowAboutModal(false)}
        dvLogo={dvLogo}
        customerLogo={aboutAppModal?.customerLogo}
        content={aboutAppModal?.content}
        bottom={aboutAppModal?.bottom}
        size={aboutAppModal?.size}
      />
    </>
  );
}
