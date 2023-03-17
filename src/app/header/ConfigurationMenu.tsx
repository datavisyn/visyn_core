import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons/faEllipsisVertical';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon, Menu } from '@mantine/core';
import React from 'react';
import { useVisynAppContext } from '../VisynAppContext';
import { AboutAppModal, IAboutAppModalConfig } from './AboutAppModal';

export function ConfigurationMenu({
  menu,
  dvLogo,
  aboutAppModal,
}: {
  menu: JSX.Element;
  dvLogo: JSX.Element;
  aboutAppModal?: JSX.Element | IAboutAppModalConfig;
}) {
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
          <Menu.Item onClick={() => setShowAboutModal(true)}>About {appName}</Menu.Item>
        </Menu.Dropdown>
      </Menu>
      {aboutAppModal && React.isValidElement(aboutAppModal) ? (
        aboutAppModal
      ) : (
        <AboutAppModal
          opened={showAboutModal}
          onClose={() => setShowAboutModal(false)}
          dvLogo={dvLogo}
          customerLogo={(aboutAppModal as IAboutAppModalConfig)?.customerLogo}
          content={(aboutAppModal as IAboutAppModalConfig)?.content}
          size={(aboutAppModal as IAboutAppModalConfig)?.size}
        />
      )}
    </>
  );
}
