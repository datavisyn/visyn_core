import React from 'react';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon, Group, Select, Tooltip } from '@mantine/core';
import type { IBarConfig } from '../interfaces';
import type { ICommonVisProps } from '../../interfaces';

export function FocusFacetSelector({ config, setConfig, facets }: Pick<ICommonVisProps<IBarConfig>, 'config' | 'setConfig'> & { facets: string[] }) {
  if (!config.facets && facets.length === 0) {
    return null;
  }

  return (
    <Group gap={4}>
      <Select
        key={`focusFacetSelect_${config.focusFacetIndex}`}
        placeholder="Select a focus facet"
        data={facets}
        value={facets[config.focusFacetIndex] || ''}
        onChange={(value) => {
          setConfig({ ...config, focusFacetIndex: typeof value === 'string' ? facets.indexOf(value) : value });
        }}
        clearable
      />
      <Tooltip label="Previous facet" position="top" withArrow>
        <ActionIcon
          color="dvGray"
          variant="subtle"
          disabled={config.focusFacetIndex === null}
          onClick={() => {
            setConfig({ ...config, focusFacetIndex: (config.focusFacetIndex - 1 + facets.length) % facets.length });
          }}
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="Next facet" position="top" withArrow>
        <ActionIcon
          color="dvGray"
          variant="subtle"
          disabled={config.focusFacetIndex === null}
          onClick={() => {
            setConfig({ ...config, focusFacetIndex: (config.focusFacetIndex + 1) % facets.length });
          }}
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}
