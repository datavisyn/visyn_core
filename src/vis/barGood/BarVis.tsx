import React, { useEffect, useMemo, useRef, useState } from 'react';
import { merge, uniqueId } from 'lodash';
import { ActionIcon, Container, Group, Tooltip } from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import { useSyncedRef } from '../../hooks/useSyncedRef';
import { EFilterOptions, IBarConfig, IVisConfig, Scales, VisColumn } from '../interfaces';
import { i18n } from '../../i18n/I18nextManager';
import { BarChart } from './BarChart';
import { VisSidebarWrapper } from '../VisSidebarWrapper';
import { BarVisSidebar } from '../bar/BarVisSidebar';
import { VisSidebarOpenButton } from '../VisSidebarOpenButton';

const defaultExtensions = {
  prePlot: null,
  postPlot: null,
  preSidebar: null,
  postSidebar: null,
};

export function BarVis({
  config,
  optionsConfig,
  extensions,
  columns,
  setConfig,
  scales,
  selectionCallback = () => null,
  selectedMap = {},
  selectedList = [],
  enableSidebar,
  showSidebar,
  setShowSidebar,
  showCloseButton = false,
  closeButtonCallback = () => null,
  filterCallback = () => null,
}: {
  config: IBarConfig;
  optionsConfig?: {
    group?: {
      enable?: boolean;
      customComponent?: React.ReactNode;
    };
    multiples?: {
      enable?: boolean;
      customComponent?: React.ReactNode;
    };
    direction?: {
      enable?: boolean;
      customComponent?: React.ReactNode;
    };
    groupingType?: {
      enable?: boolean;
      customComponent?: React.ReactNode;
    };
    display?: {
      enable?: boolean;
      customComponent?: React.ReactNode;
    };
  };
  extensions?: {
    prePlot?: React.ReactNode;
    postPlot?: React.ReactNode;
    preSidebar?: React.ReactNode;
    postSidebar?: React.ReactNode;
  };
  columns: VisColumn[];
  closeButtonCallback?: () => void;
  showCloseButton?: boolean;
  selectionCallback?: (ids: string[]) => void;
  selectedMap?: { [key: string]: boolean };
  selectedList: string[];
  setConfig: (config: IVisConfig) => void;
  scales: Scales;
  showSidebar?: boolean;
  setShowSidebar?(show: boolean): void;
  enableSidebar?: boolean;
  filterCallback?: (s: EFilterOptions) => void;
}) {
  const mergedExtensions = useMemo(() => {
    return merge({}, defaultExtensions, extensions);
  }, [extensions]);

  const ref = useRef();
  const id = React.useMemo(() => uniqueId('HexbinVis'), []);

  return (
    <Group noWrap p={0} sx={{ flexGrow: 1, height: '100%', overflow: 'hidden', width: '100%', position: 'relative' }} ref={ref}>
      {enableSidebar ? <VisSidebarOpenButton onClick={() => setShowSidebar(!showSidebar)} isOpen={showSidebar} /> : null}

      <BarChart config={config} columns={columns} selectedMap={selectedMap} selectionCallback={selectionCallback} selectedList={selectedList} />
      {showSidebar ? (
        <VisSidebarWrapper>
          <BarVisSidebar config={config} extensions={extensions} columns={columns} setConfig={setConfig} />
        </VisSidebarWrapper>
      ) : null}
    </Group>
  );
}
