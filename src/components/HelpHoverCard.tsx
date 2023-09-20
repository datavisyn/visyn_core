import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon, Group, HoverCard, Title } from '@mantine/core';
import React from 'react';

export function OrdinoHelpHoverCard({ title, content, dataCyPrefix }: { title: JSX.Element; content: JSX.Element; dataCyPrefix: string }) {
  return (
    <Group align="center" mb={2} position="apart" noWrap>
      {title}
      <HoverCard width={400} shadow="md">
        <HoverCard.Target>
          <ActionIcon>
            <FontAwesomeIcon icon={faQuestionCircle} />
          </ActionIcon>
        </HoverCard.Target>
        <HoverCard.Dropdown>{content}</HoverCard.Dropdown>
      </HoverCard>
    </Group>
  );
}
