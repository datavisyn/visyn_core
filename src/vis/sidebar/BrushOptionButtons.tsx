import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaintbrush } from '@fortawesome/free-solid-svg-icons/faPaintbrush';
import { faSquare } from '@fortawesome/free-solid-svg-icons/faSquare';
import { faSearchPlus } from '@fortawesome/free-solid-svg-icons/faSearchPlus';
import { faArrowsAlt } from '@fortawesome/free-solid-svg-icons/faArrowsAlt';
import { SegmentedControl, Tooltip } from '@mantine/core';
import * as React from 'react';
import { EScatterSelectSettings } from '../interfaces';

interface BrushOptionProps {
  callback: (dragMode: EScatterSelectSettings) => void;
  dragMode: EScatterSelectSettings;
  options?: EScatterSelectSettings[];
}

export function BrushOptionButtons({
  callback,
  dragMode,
  options = [EScatterSelectSettings.RECTANGLE, EScatterSelectSettings.LASSO, EScatterSelectSettings.PAN, EScatterSelectSettings.ZOOM],
}: BrushOptionProps) {
  return (
    <SegmentedControl
      value={dragMode}
      onChange={callback}
      data={[
        {
          label: (
            <Tooltip withinPortal withArrow arrowSize={6} label="Rectangular brush">
              <FontAwesomeIcon icon={faSquare} />
            </Tooltip>
          ),
          value: EScatterSelectSettings.RECTANGLE,
        },
        {
          label: (
            <Tooltip withinPortal withArrow arrowSize={6} label="Lasso brush">
              <FontAwesomeIcon icon={faPaintbrush} />
            </Tooltip>
          ),
          value: EScatterSelectSettings.LASSO,
        },
        {
          label: (
            <Tooltip withinPortal withArrow arrowSize={6} label="Zoom/Pan">
              <FontAwesomeIcon icon={faArrowsAlt} />
            </Tooltip>
          ),
          value: EScatterSelectSettings.PAN,
        },
        {
          label: (
            <Tooltip withinPortal withArrow arrowSize={6} label="Rectangular zoom">
              <FontAwesomeIcon icon={faSearchPlus} />
            </Tooltip>
          ),
          value: EScatterSelectSettings.ZOOM,
        },
      ].filter((d) => options.includes(d.value))}
    />
  );
}
