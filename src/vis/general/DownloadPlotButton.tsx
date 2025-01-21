import * as React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionIcon, Tooltip } from '@mantine/core';

import { dvDownloadVisualization } from '../../icons';
import { BaseVisConfig } from '../interfaces';
import { DownloadPlotOptions, useCaptureVisScreenshot } from '../useCaptureVisScreenshot';

export function DownloadPlotButton({ uniquePlotId, config, options }: { config: BaseVisConfig; uniquePlotId: string; options?: DownloadPlotOptions }) {
  const [{ isLoading }, captureScreenshot] = useCaptureVisScreenshot(uniquePlotId, config, options);
  return (
    <Tooltip label="Download visualization as image" position="top" withArrow>
      <ActionIcon data-testid="DownloadPlotButton" color="dvGray" loading={isLoading} variant="subtle" onClick={captureScreenshot}>
        <FontAwesomeIcon icon={dvDownloadVisualization} />
      </ActionIcon>
    </Tooltip>
  );
}
