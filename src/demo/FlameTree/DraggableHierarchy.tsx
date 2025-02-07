import * as React from 'react';

import { css, cx } from '@emotion/css';
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons/faEllipsisVertical';
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { ActionIcon, Box, Button, Group, Menu, Popover, Stack, Text } from '@mantine/core';
import omit from 'lodash/omit';

import { ParameterColumn } from './math';

const classItem = css`
  display: flex;
  align-items: center;
  border-radius: var(--mantine-radius-sm);
  border: 1px solid var(--mantine-color-gray-3);
  padding: var(--mantine-spacing-xs);
  background-color: var(--mantine-color-white);
  box-shadow: var(--mantine-shadow-xs);
`;

// @TODO apply styles for dragging item
const classDragging = css``;

/* const classDragHandle = css`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: light-dark(var(--mantine-color-gray-6), var(--mantine-color-dark-1));
  padding-right: var(--mantine-spacing-md);
`; */

/**
 * Default implementation of the hierarchy element in the FlameTree.
 * It allows to drag and drop the attributes to change the order of the hierarchy on the fly.
 */
export function DraggableHierarchy({
  layering,
  setLayering,
  definitions,
  itemHeight,
}: {
  layering: string[];
  setLayering: (layering: string[]) => void;
  definitions: ParameterColumn[];
  itemHeight: number;
}) {
  const maxHeight = Math.min(60, itemHeight);
  const margin = Math.max(0, itemHeight - maxHeight);

  const availableDefinitions = React.useMemo(
    () =>
      definitions.filter((definition) => {
        return !layering.includes(definition.key);
      }),
    [definitions, layering],
  );

  const items = layering.map((item, index) => (
    <Draggable key={item} index={index} draggableId={item}>
      {(provided, snapshot) => {
        return (
          <div
            className={cx(classItem, { [classDragging]: snapshot.isDragging })}
            ref={provided.innerRef}
            {...omit(provided.draggableProps, 'style')}
            style={{
              ...provided.draggableProps.style,
              height: maxHeight,
              marginBottom: margin,
            }}
          >
            <Box style={{ flexGrow: 1 }}>
              <Group>
                <Text size="sm" fw={500} truncate style={{ width: 0, flexGrow: 1 }} {...provided.dragHandleProps}>
                  {item}
                </Text>
              </Group>
              <Group justify="space-between" align="flex-end">
                <Text c="dimmed" size="xs">
                  {(() => {
                    const definition = definitions.find((entry) => entry.key === item)!;
                    return `${definition.domain.length} ${definition.type === 'categorical' ? 'categories' : 'bins'}`;
                  })()}
                </Text>

                <Group>
                  <Popover closeOnClickOutside>
                    <Popover.Target>
                      <ActionIcon size="sm" variant="subtle" c="gray.6">
                        <FontAwesomeIcon size="sm" icon={faEllipsisVertical} />
                      </ActionIcon>
                    </Popover.Target>
                    <Popover.Dropdown>
                      <Stack>
                        <Button
                          onClick={() => {
                            setLayering(layering.filter((entry) => entry !== item));
                          }}
                          variant="outline"
                          color="var(--mantine-color-error)"
                        >
                          Remove attribute
                        </Button>
                      </Stack>
                    </Popover.Dropdown>
                  </Popover>
                </Group>
              </Group>
            </Box>
          </div>
        );
      }}
    </Draggable>
  ));

  const reorder = (from: number, to: number) => {
    const newArray = [...layering];
    const [movedItem] = newArray.splice(from, 1);
    newArray.splice(to, 0, movedItem!);

    return newArray;
  };

  return (
    <Box pt={margin / 2}>
      <DragDropContext
        onDragEnd={({ destination, source }) => {
          if (!destination || !source) {
            return;
          }

          setLayering(reorder(source.index, destination.index));
        }}
      >
        <Droppable droppableId="dnd-list" direction="vertical">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {items}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <Group justify="center">
        <Menu>
          <Menu.Target>
            <Button disabled={availableDefinitions.length === 0} variant="outline" leftSection={<FontAwesomeIcon icon={faPlus} />}>
              Add attribute
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            {availableDefinitions.map((definition) => (
              <Menu.Item key={definition.key} onClick={() => setLayering([...layering, definition.key])}>
                {definition.key}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Box>
  );
}
