import * as React from 'react';

import {
  CheckIcon,
  Combobox,
  ComboboxLikeRenderOptionInput,
  OptionsData,
  OptionsFilter,
  ScrollAreaProps,
  defaultOptionsFilter,
  isOptionsGroup,
} from '@mantine/core';
import cx from 'clsx';

import { optionsDropdownCheckIcon, optionsDropdownOption } from './classes';
import { OptionProps } from './interfaces';
import { isEmptyComboboxData } from './isEmptyComboboxData';
import { validateOptions } from './validateOptions';

function isValueChecked(value: string | string[] | undefined | null, optionValue: string) {
  return Array.isArray(value) ? value.includes(optionValue) : value === optionValue;
}

function Option({ data, withCheckIcon, value, checkIconPosition, unstyled, renderOption }: OptionProps) {
  if (!isOptionsGroup(data)) {
    const checked = isValueChecked(value, data.value);
    const check = withCheckIcon && checked && <CheckIcon className={optionsDropdownCheckIcon} />;

    const defaultContent = (
      <>
        {checkIconPosition === 'left' && check}
        <span>{data.label}</span>
        {checkIconPosition === 'right' && check}
      </>
    );

    return (
      <Combobox.Option
        value={data.value}
        disabled={data.disabled}
        className={cx({ [optionsDropdownOption]: !unstyled })}
        data-reverse={checkIconPosition === 'right' || undefined}
        data-checked={checked || undefined}
        aria-selected={checked}
        active={checked}
      >
        {typeof renderOption === 'function' ? renderOption({ option: data, checked }) : defaultContent}
      </Combobox.Option>
    );
  }

  const options = data.items.map((item) => (
    <Option
      data={item}
      value={value}
      key={item.value}
      unstyled={unstyled}
      withCheckIcon={withCheckIcon}
      checkIconPosition={checkIconPosition}
      renderOption={renderOption}
    />
  ));

  return <Combobox.Group label={data.group}>{options}</Combobox.Group>;
}

export interface OptionsDropdownProps<T = unknown> {
  data: OptionsData;
  filter?: OptionsFilter;
  limit?: number;
  withScrollArea?: boolean;
  maxDropdownHeight?: number | string;
  hidden?: boolean;
  hiddenWhenEmpty?: boolean;
  filterOptions?: boolean;
  withCheckIcon?: boolean;
  search?: string;
  withSearch?: boolean;
  onSearchChange?: (value: string) => void;
  value?: string | string[] | null;
  checkIconPosition?: 'left' | 'right';
  nothingFoundMessage?: React.ReactNode;
  unstyled?: boolean;
  labelId?: string;
  'aria-label'?: string;
  renderOption?: (input: ComboboxLikeRenderOptionInput<T>) => React.ReactNode;

  /**
   * @deprecated This prop has no effect since until Mantine 8, a normal scroll bar is used instead of the ScrollArea
   */
  scrollAreaProps?: ScrollAreaProps;
}

export function DatavisynOptionsDropdown<T = unknown>({
  data,
  hidden,
  hiddenWhenEmpty,
  filter,
  limit,
  maxDropdownHeight,
  withScrollArea = true,
  search,
  onSearchChange,
  withSearch = false,
  filterOptions = true,
  withCheckIcon = false,
  value,
  checkIconPosition,
  nothingFoundMessage,
  unstyled,
  labelId,
  renderOption,
  scrollAreaProps,
  'aria-label': ariaLabel,
}: OptionsDropdownProps<T>) {
  validateOptions(data);

  const shouldFilter = typeof search === 'string';
  const filteredData = shouldFilter
    ? (filter || defaultOptionsFilter)({
        options: data,
        search: filterOptions ? search : '',
        limit: limit ?? Infinity,
      })
    : data;
  const isEmpty = isEmptyComboboxData(filteredData);

  const options = filteredData.map((item) => (
    <Option
      data={item}
      key={isOptionsGroup(item) ? item.group : item.value}
      withCheckIcon={withCheckIcon}
      value={value}
      checkIconPosition={checkIconPosition}
      unstyled={unstyled}
      renderOption={renderOption}
    />
  ));

  return (
    <Combobox.Dropdown hidden={hidden || (hiddenWhenEmpty && isEmpty)} data-composed>
      {withSearch ? <Combobox.Search size="xs" value={search} onChange={(event) => onSearchChange?.(event.target.value)} placeholder="Search" /> : null}
      <Combobox.Options labelledBy={labelId} aria-label={ariaLabel}>
        {withScrollArea ? (
          <div
            style={{
              overflowX: 'hidden',
              overflowY: 'auto',
              scrollbarWidth: 'thin',
              maxHeight: maxDropdownHeight ?? 220,
            }}
          >
            {options}
          </div>
        ) : (
          options
        )}

        {/*
        @TODO wait for mantine 8 to fix this s***** scroll area
        <ScrollArea.Autosize mah={maxDropdownHeight ?? 220} type="scroll" scrollbarSize="var(--combobox-padding)" offsetScrollbars="y" {...scrollAreaProps}>
            {options}
          </ScrollArea.Autosize> */}

        {isEmpty && nothingFoundMessage && <Combobox.Empty>{nothingFoundMessage}</Combobox.Empty>}
      </Combobox.Options>
    </Combobox.Dropdown>
  );
}
