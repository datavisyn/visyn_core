import { Box, Drawer, ScrollArea } from '@mantine/core';
import * as React from 'react';
import { ReactNode } from 'react';

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
      padding="sm"
      lockScroll={false}
      overlayOpacity={0}
      zIndex={50}
      styles={{
        drawer: { position: 'absolute', overflow: 'hidden' },
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
      size="sm"
    >
      <ScrollArea p={0} w="100%" h="100%">
        <Box pb="xl" style={{ height: '100%', width: '100%' }}>
          {children}
        </Box>
      </ScrollArea>
    </Drawer>
  );
}
