const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Prefer CJS (`require` / `react-native`) over ESM `import`.
// Zustand 4.5 ESM uses `import.meta.env`, which crashes Expo web
// ("Cannot use 'import.meta' outside a module" → white screen).
config.resolver.unstable_conditionNames = [
  'react-native',
  'require',
  'default',
];

module.exports = config;
