import * as React from 'react';

import {
  CheckIcon,
  Combobox,
  ComboboxItem,
  ComboboxLikeRenderOptionInput,
  ComboboxParsedItem,
  ScrollArea,
  ScrollAreaProps,
  defaultOptionsFilter,
  isOptionsGroup,
} from '@mantine/core';
import cx from 'clsx';

import { FilterOptionsInput } from './default-options-filter';
import { isEmptyComboboxData } from './is-empty-combobox-data';
import { optionsDropdownCheckIcon, optionsDropdownOptions } from './styles';
import { validateOptions } from './validate-options';

export type OptionsFilter = (input: FilterOptionsInput) => ComboboxParsedItem[];

export interface OptionsGroup {
  group: string;
  items: ComboboxItem[];
}

export type OptionsData = (ComboboxItem | OptionsGroup)[];

interface OptionProps {
  data: ComboboxItem | OptionsGroup;
  withCheckIcon?: boolean;
  value?: string | string[] | null;
  checkIconPosition?: 'left' | 'right';
  renderOption?: (input: ComboboxLikeRenderOptionInput<any>) => React.ReactNode;
}

function isValueChecked(value: string | string[] | undefined | null, optionValue: string) {
  return Array.isArray(value) ? value.includes(optionValue) : value === optionValue;
}

function Option({ data, withCheckIcon, value, checkIconPosition, renderOption }: OptionProps) {
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
        className={optionsDropdownOptions}
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
    <Option data={item} value={value} key={item.value} withCheckIcon={withCheckIcon} checkIconPosition={checkIconPosition} renderOption={renderOption} />
  ));

  return <Combobox.Group label={data.group}>{options}</Combobox.Group>;
}

export interface OptionsDropdownProps {
  data: OptionsData;
  filter?: OptionsFilter;
  search?: string;
  limit?: number;
  withScrollArea?: boolean;
  maxDropdownHeight: number | string | undefined;
  hidden?: boolean;
  hiddenWhenEmpty?: boolean;
  filterOptions?: boolean;
  withCheckIcon?: boolean;
  value?: string | string[] | null;
  checkIconPosition?: 'left' | 'right';
  nothingFoundMessage?: React.ReactNode;
  labelId?: string;
  renderOption?: (input: ComboboxLikeRenderOptionInput<any>) => React.ReactNode;
  scrollAreaProps?: ScrollAreaProps;
}

export function VisynOptionsDropdown({
  data,
  hidden,
  hiddenWhenEmpty,
  filter,
  search,
  limit,
  maxDropdownHeight,
  withScrollArea = true,
  filterOptions = true,
  withCheckIcon = false,
  value,
  checkIconPosition,
  nothingFoundMessage,
  labelId,
  renderOption,
  scrollAreaProps,
}: OptionsDropdownProps) {
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
      renderOption={renderOption}
    />
  ));

  return (
    <Combobox.Dropdown hidden={hidden || (hiddenWhenEmpty && isEmpty)} data-composed>
      <Combobox.Options labelledBy={labelId}>
        {withScrollArea ? (
          <ScrollArea.Autosize mah={maxDropdownHeight ?? 220} type="scroll" scrollbarSize="var(--combobox-padding)" offsetScrollbars="y" {...scrollAreaProps}>
            {options}
          </ScrollArea.Autosize>
        ) : (
          options
        )}
        {isEmpty && nothingFoundMessage && <Combobox.Empty>{nothingFoundMessage}</Combobox.Empty>}
      </Combobox.Options>
    </Combobox.Dropdown>
  );
}
