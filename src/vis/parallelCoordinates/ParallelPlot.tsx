import * as React from 'react';
import merge from 'lodash/merge';
import uniqueId from 'lodash/uniqueId';
import { useEffect, useState } from 'react';
import { Center, Group, Stack } from '@mantine/core';
import * as d3 from 'd3v7';
import { EFilterOptions, IVisConfig, Scales, IScatterConfig, VisColumn, EScatterSelectSettings, IParallelCoordinatesConfig } from '../interfaces';
import { InvalidCols } from '../general/InvalidCols';
import { beautifyLayout } from '../general/layoutUtils';
import { BrushOptionButtons } from '../sidebar/BrushOptionButtons';
import { PlotlyComponent } from '../../plotly';
import { Plotly } from '../../plotly/full';
import { useAsync } from '../../hooks';
import { VisSidebarWrapper } from '../VisSidebarWrapper';
import { CloseButton } from '../sidebar/CloseButton';
import { i18n } from '../../i18n';
import { VisSidebarOpenButton } from '../VisSidebarOpenButton';
import { ScatterVisSidebar } from '../scatter/ScatterVisSidebar';
import { ParallelVisSidebar } from './ParallelVisSidebar';

const defaultExtensions = {
  prePlot: null,
  postPlot: null,
  preSidebar: null,
  postSidebar: null,
};

const margin = {
  top: 30,
  right: 10,
  bottom: 10,
  left: 10,
};

export function ParallelPlot() {
  return (
    <svg>
      <path stroke="black" strokeWidth={2} d=" M 2,2 h 20 " />
    </svg>
  );
}
