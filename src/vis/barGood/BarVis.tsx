import React, { useEffect, useMemo, useRef, useState } from 'react';
import { merge, uniqueId } from 'lodash';
import { ActionIcon, Container, Tooltip } from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import { useSyncedRef } from '../../hooks/useSyncedRef';
import { IBarConfig, IVisConfig, Scales, VisColumn } from '../interfaces';
import { i18n } from '../../i18n/I18nextManager';
import { BarChart } from './BarChart';
import { VisSidebarWrapper } from '../VisSidebarWrapper';
import { BarVisSidebar } from '../bar/BarVisSidebar';

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
}) {
  const mergedExtensions = useMemo(() => {
    return merge({}, defaultExtensions, extensions);
  }, [extensions]);

  const ref = useRef();
  const id = React.useMemo(() => uniqueId('HexbinVis'), []);

  const [sidebarMounted, setSidebarMounted] = useState<boolean>(false);

  // Cheating to open the sidebar after the first render, since it requires the container to be mounted
  useEffect(() => {
    setSidebarMounted(true);
  }, [setSidebarMounted]);

  return (
    <Container p={0} fluid sx={{ flexGrow: 1, height: '100%', overflow: 'hidden', width: '100%', position: 'relative' }} ref={ref}>
      {enableSidebar ? (
        <Tooltip withinPortal label={i18n.t('visyn:vis.openSettings')}>
          <ActionIcon sx={{ zIndex: 10, position: 'absolute', top: '10px', right: '10px' }} onClick={() => setShowSidebar(true)}>
            <FontAwesomeIcon icon={faGear} />
          </ActionIcon>
        </Tooltip>
      ) : null}
      <BarChart config={config} columns={columns} selectedMap={selectedMap} selectionCallback={selectionCallback} selectedList={selectedList} />
      {showSidebar && sidebarMounted ? (
        <VisSidebarWrapper id={id} target={ref.current} open={showSidebar} onClose={() => setShowSidebar(false)}>
          <BarVisSidebar config={config} extensions={extensions} columns={columns} setConfig={setConfig} />
        </VisSidebarWrapper>
      ) : null}
    </Container>
  );
}
