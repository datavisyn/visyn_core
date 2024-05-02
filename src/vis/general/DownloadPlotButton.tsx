import { Tooltip, ActionIcon } from '@mantine/core';
import * as React from 'react';
import { BaseVisConfig } from '../interfaces';
import { useCaptureVisScreenshot } from '../useCaptureVisScreenshot';

export function DownloadPlotButton({ uniquePlotId, config }: { config: BaseVisConfig; uniquePlotId: string }) {
  const [{ isLoading }, captureScreenshot] = useCaptureVisScreenshot(uniquePlotId, config);
  return (
    <Tooltip label="Download plot as PNG" position="top">
      <ActionIcon title="Download plot as PNG" color="dvGray" loading={isLoading} variant="subtle" onClick={captureScreenshot}>
        <i className="fa-solid fa-camera" />
      </ActionIcon>
    </Tooltip>
  );
}
