import { Tooltip, ActionIcon } from '@mantine/core';
import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { BaseVisConfig } from '../interfaces';
import { useCaptureVisScreenshot } from '../useCaptureVisScreenshot';
import { dvDownloadVisualization } from '../../icons';

export function DownloadPlotButton({ uniquePlotId, config }: { config: BaseVisConfig; uniquePlotId: string }) {
  const [{ isLoading }, captureScreenshot] = useCaptureVisScreenshot(uniquePlotId, config);
  return (
    <Tooltip label="Download visualization as image" position="top" withArrow>
      <ActionIcon data-testid="DownloadPlotButton" color="dvGray" loading={isLoading} variant="subtle" onClick={captureScreenshot}>
        <FontAwesomeIcon icon={dvDownloadVisualization} />
      </ActionIcon>
    </Tooltip>
  );
}
