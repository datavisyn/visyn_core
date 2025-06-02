import * as React from 'react';

import {
  Combobox,
  ComboboxItem,
  ComboboxLikeRenderOptionInput,
  ComboboxParsedItem,
  ComboboxSearchProps,
  MantineSize,
  ScrollArea,
  ScrollAreaProps,
  Space,
  defaultOptionsFilter,
  isOptionsGroup,
} from '@mantine/core';

import { OptionsFilter } from './interfaces';
import { isEmptyComboboxData } from './is-empty-combobox-data';
import { optionsDropdownOptions } from './styles';
import { validateOptions } from './validate-options';
import { VisynCheckIcon } from './visyn-check-icon';

interface OptionsGroup {
  group: string;
  items: ComboboxItem[];
}

type OptionsData = (ComboboxItem | OptionsGroup)[];

interface OptionProps {
  data: ComboboxItem | OptionsGroup;
  withCheckIcon?: boolean;
  value?: string | string[] | null;
  renderOption?: (input: ComboboxLikeRenderOptionInput<any>) => React.ReactNode;
}

function isValueChecked(value: string | string[] | undefined | null, optionValue: string) {
  return Array.isArray(value) ? value.includes(optionValue) : value === optionValue;
}

function Option({ data, withCheckIcon, value, renderOption }: OptionProps) {
  if (!isOptionsGroup(data)) {
    const checked = isValueChecked(value, data.value);
    // Space of 1em is aligned with the check-icon and the select target
    const check = withCheckIcon && checked ? <VisynCheckIcon /> : <Space w="1em" />;

    return (
      <Combobox.Option
        value={data.value}
        disabled={data.disabled}
        data-checked={checked || undefined}
        data-reverse="right"
        active={checked}
        className={optionsDropdownOptions}
      >
        {typeof renderOption === 'function' ? renderOption({ option: data, checked }) : <span>{data.label}</span>}
        {check}
      </Combobox.Option>
    );
  }

  const options = data.items.map((item) => <Option data={item} value={value} key={item.value} withCheckIcon={withCheckIcon} renderOption={renderOption} />);

  return <Combobox.Group label={data.group}>{options}</Combobox.Group>;
}

export interface OptionsDropdownProps<D extends ComboboxParsedItem> {
  data: D[];
  filter?: OptionsFilter<D>;
  limit?: number;
  withScrollArea?: boolean;
  maxDropdownHeight: number | string | undefined;
  hidden?: boolean;
  withCheckIcon?: boolean;
  value?: string | string[] | null;
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
    <Option data={item} key={isOptionsGroup(item) ? item.group : item.value} withCheckIcon={withCheckIcon} value={value} renderOption={renderOption} />
  ));

  return (
    <Combobox.Dropdown hidden={hidden}>
      {searchable ? (
        <Combobox.Search size={size} value={searchValue} onChange={(event) => onSearchChange?.(event.currentTarget.value)} {...comboboxSearchProps} />
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
