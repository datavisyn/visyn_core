import { VisynEnv } from './VisynEnv';

const getBrowserInfo = () => {
  const { userAgent } = navigator;

  const browsers = [
    { name: 'Mozilla Firefox', pattern: /Firefox\/([\d.]+)/ },
    { name: 'Google Chrome', pattern: /Chrome\/([\d.]+)/ },
    { name: 'Safari', pattern: /Version\/([\d.]+).*Safari/ },
    { name: 'Microsoft Edge', pattern: /Edg\/([\d.]+)/ },
    { name: 'Opera', pattern: /OPR\/([\d.]+)/ },
  ];

  for (const { name, pattern } of browsers) {
    const match = userAgent.match(pattern);
    if (match) {
      return { browserName: name, fullVersion: match[1] };
    }
  }

  return { browserName: 'Unknown', fullVersion: 'Unknown' };
};

export const generateVersionInfo = () => {
  const version = VisynEnv.__VERSION__;
  const buildId = VisynEnv.__BUILD_ID__ ?? '';
  const info = getBrowserInfo();
  const appUrl = window.location.href;

  return `Version: ${version} (${buildId})\nBrowser: ${info.browserName} ${info.fullVersion}\nURL: ${appUrl}`;
};
