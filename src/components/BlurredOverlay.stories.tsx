import { BlurredOverlay } from './BlurredOverlay';

export default { title: 'components/BlurredOverlay', component: BlurredOverlay };

export const Default = {
  args: {
    loading: true,
  },
};

export const LoadingInProgress = {
  args: {
    loadingText: 'Loading...',
    loading: true,
    loaderProps: {
      color: 'dvPrimary',
    },
    dataTestId: 'blurred-overlay-loading',
  },
};

export const LoadingFinished = {
  args: {
    loading: false,
    visible: true,
    children: 'Hello World!',
    dataTestId: 'blurred-overlay-finished',
  },
};
