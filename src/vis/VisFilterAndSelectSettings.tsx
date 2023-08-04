import { ActionIcon, Divider, Group, Tooltip } from '@mantine/core';
import * as React from 'react';
import { FilterClear } from '../assets/icons/FilterClear';
import { FilterEmpty } from '../assets/icons/FilterEmpty';
import { FilterFilled } from '../assets/icons/FilterFilled';
import { EFilterOptions, EScatterSelectSettings } from './interfaces';
import { BrushOptionButtons } from './sidebar/BrushOptionButtons';

export function VisFilterAndSelectSettings({
  onBrushOptionsCallback,
  onFilterCallback,
  dragMode,
  showSelect,
  selectOptions = [EScatterSelectSettings.RECTANGLE, EScatterSelectSettings.LASSO, EScatterSelectSettings.PAN, EScatterSelectSettings.ZOOM],
}: {
  onBrushOptionsCallback: (dragMode: EScatterSelectSettings) => void;
  onFilterCallback: (opt: EFilterOptions) => void;
  dragMode: EScatterSelectSettings;
  showSelect: boolean;
  selectOptions?: EScatterSelectSettings[];
}) {
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
      {showSelect ? <BrushOptionButtons callback={onBrushOptionsCallback} dragMode={dragMode} options={selectOptions} /> : null}
    </Group>
  );
}
