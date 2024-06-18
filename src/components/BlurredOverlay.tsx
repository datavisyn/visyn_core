import { Box, LoadingOverlay, Loader, Stack } from '@mantine/core';
import * as React from 'react';

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
