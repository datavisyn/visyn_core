import { Container, Stack, Chip, Tooltip, Box, ScrollArea } from '@mantine/core';
import * as hex from 'd3-hexbin';
import { HexbinBin } from 'd3-hexbin';
import * as d3v7 from 'd3v7';
import { D3BrushEvent, D3ZoomEvent } from 'd3v7';
import uniqueId from 'lodash/uniqueId';
import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAsync } from '../../hooks/useAsync';
import { VisColumn, IHexbinConfig, EScatterSelectSettings, IScatterConfig } from '../interfaces';
import { SingleHex } from './SingleHex';
import { getHexData } from './utils';
import { XAxis } from './XAxis';
import { YAxis } from './YAxis';

export function Scatterplot({ config, columns }: { config: IScatterConfig; columns: VisColumn[] }) {
  return <svg></svg>;
}
