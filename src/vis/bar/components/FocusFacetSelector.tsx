import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon, Group, Select, Tooltip } from '@mantine/core';
import React from 'react';
import type { ICommonVisProps } from '../../interfaces';
import { IBarConfig } from '../interfaces';

export function FocusFacetSelector({ config, setConfig, facets }: Pick<ICommonVisProps<IBarConfig>, 'config' | 'setConfig'> & { facets: string[] }) {
  if (!config?.facets && facets.length === 0) {
    return null;
  }

  return (
    config && (
      <Group gap={4} wrap="nowrap">
        <Select
          key={`focusFacetSelect_${config.focusFacetIndex ?? 0}`}
          placeholder="Select a focus facet"
          data={facets}
          value={facets[config.focusFacetIndex ?? 0] || ''}
          onChange={(value) => {
            setConfig?.({ ...config, focusFacetIndex: typeof value === 'string' ? facets.indexOf(value) : value });
          }}
          clearable
        />
        <Tooltip label="Previous facet" position="top" withArrow>
          <ActionIcon
            color="dvGray"
            variant="subtle"
            disabled={(config.focusFacetIndex ?? 0) === null}
            onClick={() => {
              setConfig?.({ ...config, focusFacetIndex: ((config.focusFacetIndex ?? 0) - 1 + facets.length) % facets.length });
            }}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Next facet" position="top" withArrow>
          <ActionIcon
            color="dvGray"
            variant="subtle"
            disabled={(config.focusFacetIndex ?? 0) === null}
            onClick={() => {
              setConfig?.({ ...config, focusFacetIndex: ((config.focusFacetIndex ?? 0) + 1) % facets.length });
            }}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </ActionIcon>
        </Tooltip>
      </Group>
    )
  );
}
