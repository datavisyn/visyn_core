const path = require('path');
module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials', '@storybook/addon-interactions', '@storybook/preset-scss', 'storybook-addon-swc', '@storybook/addon-mdx-gfm'],
  framework: {
    name: '@storybook/react-webpack5',
    options: {}
  },
  webpackFinal: async config => {
    // This is required to enable TS moduleResolution: node16, as there we have to add .js extensions which are actually .ts files.
    config.resolve.extensionAlias = {
      ...(config.resolve.extensionAlias || {}),
      '.js': ['.tsx', '.ts', '.js'],
      '.cjs': ['.cts', '.cjs'],
      '.mjs': ['.mts', '.mjs']
    }, config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // I have no clue why this is required, but if this is missing we get a "Can't resolve '../../assets/icons/datavisyn_logo.svg' in '.../src/scss'""
      '../../assets': path.resolve(__dirname, '../src/assets'),
      // Add visyn_core/dist as alias, as we have scss/code imports like visyn_core/dist/assets/...
      'visyn_core/dist': path.resolve(__dirname, '../src'),
      'visyn_core/src': path.resolve(__dirname, '../src'),
      'visyn_core': path.resolve(__dirname, '../src')
    };
    return config;
  },
  docs: {
    autodocs: true
  }
};