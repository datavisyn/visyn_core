import * as React from 'react';
import { ActionIcon, Center, Container, Divider, Group, Stack, Tooltip } from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons/faGear';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { i18n } from '../i18n';
import { FilterEmpty } from '../assets/icons/FilterEmpty';
import { FilterClear } from '../assets/icons/FilterClear';
import { FilterFilled } from '../assets/icons/FilterFilled';
import { BarGroupTypeButtons } from './sidebar/BarGroupTypeButtons';
import { EFilterOptions, EScatterSelectSettings } from './interfaces';
import { BrushOptionButtons } from './sidebar/BrushOptionButtons';

export function VisFilterAndSelectSettings({
  onBrushOptionsCallback,
  onFilterCallback,
  dragMode,
  showSelect,
}: {
  onBrushOptionsCallback: (dragMode: EScatterSelectSettings) => void;
  onFilterCallback: (opt: EFilterOptions) => void;
  dragMode: EScatterSelectSettings;
  showSelect: boolean;
}) {
  console.log(showSelect);
  return (
    <Group sx={{ zIndex: 10 }}>
      <Group p={2} spacing={2} sx={{ background: '#f1f3f5', borderRadius: '3px' }}>
        <Tooltip withinPortal withArrow arrowSize={6} label="Remove current selection">
          <ActionIcon onClick={() => onFilterCallback(EFilterOptions.OUT)}>
            <FilterEmpty width={18} height={18} color="#495057" />
          </ActionIcon>
        </Tooltip>

        <Divider my={3} orientation="vertical" color="gray.3" />
        <Tooltip withinPortal withArrow arrowSize={6} label="Remove all points that are not currently selected">
          <ActionIcon onClick={() => onFilterCallback(EFilterOptions.IN)}>
            <FilterFilled width={18} height={18} color="#495057" />
          </ActionIcon>
        </Tooltip>

        <Divider my={3} orientation="vertical" color="gray.3" />
        <Tooltip withinPortal withArrow arrowSize={6} label="Clear all filters">
          <ActionIcon onClick={() => onFilterCallback(EFilterOptions.CLEAR)}>
            <FilterClear width={18} height={18} color="#495057" />
          </ActionIcon>
        </Tooltip>
      </Group>
      {showSelect ? <BrushOptionButtons callback={onBrushOptionsCallback} dragMode={dragMode} /> : null}
    </Group>
  );
}
