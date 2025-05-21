import * as React from 'react';

import {
  Combobox,
  ComboboxItem,
  ComboboxLikeRenderOptionInput,
  ComboboxParsedItem,
  ComboboxSearchProps,
  Group,
  MantineSize,
  ScrollArea,
  ScrollAreaProps,
  Space,
  defaultOptionsFilter,
  isOptionsGroup,
} from '@mantine/core';

import { FilterOptionsInput } from './default-options-filter';
import { isEmptyComboboxData } from './is-empty-combobox-data';
import { validateOptions } from './validate-options';
import { VisynCheckIcon } from './visyn-check-icon';
import { optionsDropdownOptions } from './styles';

export type OptionsFilter = (input: FilterOptionsInput) => ComboboxParsedItem[];

export interface OptionsGroup {
  group: string;
  items: ComboboxItem[];
}

export type VisynComboboxItem = ComboboxItem;

export type VisynOptionsGroup = OptionsGroup;

export type VisynOptionsData = (VisynComboboxItem | VisynOptionsGroup)[];

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
    const check = withCheckIcon && checked ? <VisynCheckIcon /> : <Space w="0.8em" />;

    return (
      <Combobox.Option value={data.value} disabled={data.disabled} data-checked={checked || undefined} active={checked} className={optionsDropdownOptions}>
        <Group gap={8} wrap="nowrap">
          {checkIconPosition === 'left' ? check : null}
          {typeof renderOption === 'function' ? renderOption({ option: data, checked }) : <span>{data.label}</span>}
          {checkIconPosition === 'right' ? check : null}
        </Group>
      </Combobox.Option>
    );
  }

  const options = data.items.map((item) => (
    <Option data={item} value={value} key={item.value} withCheckIcon={withCheckIcon} checkIconPosition={checkIconPosition} renderOption={renderOption} />
  ));

  return <Combobox.Group label={data.group}>{options}</Combobox.Group>;
}

export interface OptionsDropdownProps<D extends ComboboxParsedItem> {
  data: D[];
  filter?: OptionsFilter;
  limit?: number;
  withScrollArea?: boolean;
  maxDropdownHeight: number | string | undefined;
  hidden?: boolean;
  withCheckIcon?: boolean;
  value?: string | string[] | null;
  checkIconPosition?: 'left' | 'right';
  nothingFoundMessage?: React.ReactNode;
  labelId?: string;
  renderOption?: (input: ComboboxLikeRenderOptionInput<D>) => React.ReactNode;
  scrollAreaProps?: ScrollAreaProps;
  searchValue?: string;
  onSearchChange?: (search: string) => void;
  comboboxSearchProps?: ComboboxSearchProps;
  size?: MantineSize;
  searchable?: boolean;
}

export function VisynOptionsDropdown<D extends OptionsData[0]>({
  data,
  hidden,
  filter,
  limit,
  maxDropdownHeight,
  withScrollArea,
  withCheckIcon = true,
  value,
  checkIconPosition = 'left',
  nothingFoundMessage = 'No items match your search',
  labelId,
  renderOption,
  scrollAreaProps,
  searchValue,
  onSearchChange,
  comboboxSearchProps,
  size,
  searchable = true,
}: OptionsDropdownProps<D>) {
  validateOptions(data);

  const filteredData =
    searchValue !== undefined && searchable
      ? (filter || defaultOptionsFilter)({
          options: data,
          search: searchValue,
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
    <Combobox.Dropdown hidden={hidden}>
      {searchable ? (
        <Combobox.Search
          size={size}
          value={searchValue}
          onChange={(event) => onSearchChange?.(event.currentTarget.value)}
          placeholder="Search items"
          {...comboboxSearchProps}
        />
      ) : null}

      <Combobox.Options labelledBy={labelId}>
        {withScrollArea ? (
          <ScrollArea.Autosize mah={maxDropdownHeight ?? 220} type="scroll" {...scrollAreaProps}>
            {options}
          </ScrollArea.Autosize>
        ) : (
          options
        )}

        {isEmpty && nothingFoundMessage ? <Combobox.Empty>{nothingFoundMessage}</Combobox.Empty> : null}
      </Combobox.Options>
    </Combobox.Dropdown>
  );
}
