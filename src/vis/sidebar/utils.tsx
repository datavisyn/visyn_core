import * as React from 'react';
import Highlighter from 'react-highlight-words';
import { Stack, Tooltip, Text, Box, CloseButton, useMantineTheme } from '@mantine/core';
import { forwardRef } from 'react';
import { ColumnInfo, VisNumericalColumn, VisCategoricalColumn, VisColumn } from '../interfaces';

export const formatOptionLabel = (option, ctx) => {
  return (
    <>
      <Highlighter searchWords={[ctx.inputValue]} autoEscape textToHighlight={option.name} />
      {option.description && <span className="small text-muted ms-1">{option.description}</span>}
    </>
  );
};

export function getCol(columns: VisColumn[], info: ColumnInfo | null): VisNumericalColumn | VisCategoricalColumn | null {
  if (!info) {
    return null;
  }
  return columns.filter((c) => c.info.id === info.id)[0];
}

interface ItemProps extends React.ComponentPropsWithoutRef<'div'> {
  value: string;
  label: string;
  description: string;
}

// eslint-disable-next-line react/display-name
export const SelectDropdownItem = forwardRef<HTMLDivElement, ItemProps>(({ value, label, description, ...others }: ItemProps, ref) => (
  <div ref={ref} {...others}>
    <Stack gap={0}>
      <Text>{label}</Text>
      <Text size="xs" opacity={0.5}>
        {description}
      </Text>
    </Stack>
  </div>
));

export function SelectLabelComponent({ value, label, description, onRemove, classNames, ...others }) {
  const theme = useMantineTheme();

  return (
    <div {...others}>
      <Tooltip
        withinPortal
        withArrow
        arrowSize={6}
        label={
          <Stack gap={0}>
            <Text>{label}</Text>
            <Text size="xs" color="dimmed">
              {description}
            </Text>
          </Stack>
        }
      >
        <Box
          style={{
            display: 'flex',
            cursor: 'default',
            alignItems: 'center',
            backgroundColor: theme.colors.gray[1],
            paddingLeft: theme.spacing.xs,
            borderRadius: theme.radius.sm,
          }}
        >
          <Text fw={500} style={{ lineHeight: 1, fontSize: 12, color: '#495057' }}>
            {label}
          </Text>
          <CloseButton onMouseDown={onRemove} color="gray" variant="transparent" size={22} iconSize={12} tabIndex={-1} />
        </Box>
      </Tooltip>
    </div>
  );
}
