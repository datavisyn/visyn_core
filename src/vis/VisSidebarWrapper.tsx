import { Box, Drawer, ScrollArea } from '@mantine/core';
import * as React from 'react';
import { ReactNode } from 'react';

const sidebarSize = 200;
const padding = 10;

export function VisSidebarWrapper({
  id,
  children,
  open = true,
  target,
  onClose,
}: {
  id: string;
  children: ReactNode;
  open?: boolean;
  target: HTMLElement;
  onClose: () => void;
}) {
  return (
    <Drawer
      closeOnClickOutside
      padding={padding}
      lockScroll={false}
      overlayProps={{
        opacity: 0,
      }}
      zIndex={50}
      styles={{
        content: { position: 'absolute', overflow: 'hidden' },
        root: { position: 'absolute', padding: 0, overflow: 'hidden' },
        header: { margin: 0 },
        body: { height: '100%' },
      }}
      position="right"
      withinPortal
      shadow="xl"
      target={target}
      opened={open}
      onClose={() => onClose()}
      size={`${sidebarSize + padding * 2}px`}
    >
      <ScrollArea p={0} w={`${sidebarSize}px`} h="100%">
        <Box pb="xl" style={{ height: '100%', width: `${sidebarSize}px` }}>
          {children}
        </Box>
      </ScrollArea>
    </Drawer>
  );
}
