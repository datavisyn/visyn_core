import { VisynEnv } from './VisynEnv';

const getBrowserInfo = () => {
  const { userAgent } = navigator;

  if (userAgent.includes('Firefox')) {
    return {
      browserName: 'Mozilla Firefox',
      fullVersion: userAgent.match(/Firefox\/([\d.]+)/)?.[1] || 'Unknown',
    };
  }

  if (userAgent.includes('Chrome') && !userAgent.includes('Edg') && !userAgent.includes('OPR')) {
    return {
      browserName: 'Google Chrome',
      fullVersion: userAgent.match(/Chrome\/([\d.]+)/)?.[1] || 'Unknown',
    };
  }

  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    return {
      browserName: 'Safari',
      fullVersion: userAgent.match(/Version\/([\d.]+)/)?.[1] || 'Unknown',
    };
  }

  if (userAgent.includes('Edg')) {
    return {
      browserName: 'Microsoft Edge',
      fullVersion: userAgent.match(/Edg\/([\d.]+)/)?.[1] || 'Unknown',
    };
  }

  if (userAgent.includes('OPR')) {
    return {
      browserName: 'Opera',
      fullVersion: userAgent.match(/OPR\/([\d.]+)/)?.[1] || 'Unknown',
    };
  }

  return { browserName: 'Unknown', fullVersion: 'Unknown' };
};

export const generateVersionInfo = () => {
  const version = VisynEnv.__VERSION__;
  const buildId = VisynEnv.__BUILD_ID__ ?? '';
  const info = getBrowserInfo();
  const appUrl = window.location.href;

  return `Version: ${version} (${buildId}), Browser: ${info.browserName} ${info.fullVersion}, URL: ${appUrl}`;
};
