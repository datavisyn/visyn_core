import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon, Group, HoverCard, Title } from '@mantine/core';
import React from 'react';

export function HelpHoverCard({ title, content, dataCyPrefix }: { title: JSX.Element; content: JSX.Element; dataCyPrefix?: string }) {
  return (
    <Group align="center" mb={2} justify="space-between" wrap="nowrap">
      {title}
      <HoverCard width={400} shadow="md" withinPortal>
        <HoverCard.Target>
          <ActionIcon variant="subtle">
            <FontAwesomeIcon icon={faQuestionCircle} />
          </ActionIcon>
        </HoverCard.Target>
        <HoverCard.Dropdown>{content}</HoverCard.Dropdown>
      </HoverCard>
    </Group>
  );
}
