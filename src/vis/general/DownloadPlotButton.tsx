import { Tooltip, ActionIcon } from '@mantine/core';
import html2canvas from 'html2canvas';
import * as React from 'react';
import { BaseVisConfig } from '../interfaces';

export function DownloadPlotButton({ visRef, config }: { config: BaseVisConfig; visRef: React.RefObject<HTMLDivElement> }) {
  return (
    <Tooltip label="Download plot as PNG" position="top">
      <ActionIcon
        title="Download plot as PNG"
        color="dvGray"
        variant="subtle"
        onClick={() => {
          html2canvas(visRef.current, {
            width: visRef.current.offsetWidth,
            height: visRef.current.offsetHeight,
          }).then((canvas) => {
            const link = document.createElement('a');
            link.download = `${config.type}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
          });
        }}
      >
        <i className="fa-solid fa-camera" />
      </ActionIcon>
    </Tooltip>
  );
}
