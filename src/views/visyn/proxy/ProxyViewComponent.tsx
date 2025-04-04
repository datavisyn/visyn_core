// Gets into the phovea.ts
import * as React from 'react';
import { useRef, useState } from 'react';

import { BlurredOverlay } from '../../../components/BlurredOverlay';

export interface IProxyViewProps {
  /**
   * Site that you want to view
   */
  site: string;
}

/**
 * This simple proxy view is intended to be used inside of a visyn view component which does the required mapping between
 * types. Shows a loading icon while the website is loading.
 */
export function ProxyViewComponent({ site }: IProxyViewProps) {
  const loadingFrame = useRef<HTMLIFrameElement>(null);
  const [websiteLoading, setWebsiteLoading] = useState<boolean>(true);

  React.useEffect(() => {
    const listener = () => {
      setWebsiteLoading(false);
    };

    const currentNode = loadingFrame.current;

    if (currentNode) {
      setWebsiteLoading(true);
      currentNode.addEventListener('load', listener);
      currentNode.addEventListener('loadstart', listener);
    }

    return () => currentNode?.removeEventListener('load', listener);
  }, [loadingFrame, site]);

  return (
    <>
      {websiteLoading && <BlurredOverlay loading />}
      <div className="w-100 h-100">
        <iframe ref={loadingFrame} className="w-100 h-100" src={site} data-testid="proxy-view-iframe" />
      </div>
    </>
  );
}
