import * as React from 'react';

import { Box, Loader, LoadingOverlay, Stack } from '@mantine/core';

/**
 * A blurred overlay that can be used to show a loading spinner and/or a loading text.
 * The overlay is blurred and covers the whole screen or the parent element.
 * Use the `visible` prop to show the overlay without the loading spinner and its children.
 */
export function BlurredOverlay({
  // eslint-disable-next-line react/jsx-no-useless-fragment
  children = <></>,
  // eslint-disable-next-line react/jsx-no-useless-fragment
  loadingText = <></>,
  loaderProps = {
    color: `dvGray.6`,
  },
  visible = false,
  loading = false,
  dataTestId,
}: {
  children?: React.ReactNode;
  loadingText?: React.ReactNode;
  loaderProps?: React.ComponentPropsWithoutRef<typeof Loader>;
  loading?: boolean;
  visible?: boolean;
  dataTestId?: string;
}) {
  return (
    <LoadingOverlay
      className="mantine-BlurredOverlay-root"
      overlayProps={{
        blur: 2,
      }}
      styles={{
        root: {
          padding: 'inherit',
        },
      }}
      // Set the zIndex explicitly to 200 (default 400) as it otherwise covers tooltips, popovers, ... (even within portals)
      zIndex={200}
      visible={visible || loading}
      loaderProps={{
        children: (
          <Stack align="center" data-testid={dataTestId}>
            {loading ? (
              <>
                <Loader {...loaderProps} />
                {loadingText}
              </>
            ) : (
              <Box
                p="md"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.5)',
                  borderRadius: '4px',
                  display: 'grid',
                  placeContent: 'center',
                }}
              >
                {children}
              </Box>
            )}
          </Stack>
        ),
      }}
    />
  );
}
