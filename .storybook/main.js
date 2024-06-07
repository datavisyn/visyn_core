module.exports = require('visyn_scripts/config/storybook.main.template');

const config = {
    ...c,
    addons: [
      // Other Storybook addons
      ...c.addons,
      "@chromatic-com/storybook",
    ],
  };
  export default config;