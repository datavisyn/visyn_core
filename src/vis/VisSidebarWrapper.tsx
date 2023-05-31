import { Box, Divider, Drawer, Group, ScrollArea } from '@mantine/core';
import * as React from 'react';
import { ReactNode } from 'react';

const sidebarSize = 200;
const padding = 10;

export function VisSidebarWrapper({ children }: { children: ReactNode }) {
  return (
    <Box pt="sm" style={{ height: '100%', boxShadow: '2px 0px 15px 0px lightgray', zIndex: 5 }}>
      <Group spacing={0} style={{ width: '100%', height: '100%' }} noWrap>
        {/* <Divider orientation="vertical" size="xs" /> */}
        <ScrollArea p={0} w={`${sidebarSize}px`} h="100%">
          <Box pb="xl" style={{ height: '100%', width: `${sidebarSize}px` }}>
            {children}
          </Box>
        </ScrollArea>
      </Group>
    </Box>
  );
}
