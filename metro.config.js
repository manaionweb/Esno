const { getDefaultConfig } = require('expo/metro-config');
const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config');

const config = getDefaultConfig(__dirname);

const { transformer, resolver } = config;

// Force Metro to prioritize React Native / CJS versions to avoid 'import.meta' in ESM-only files
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = ['react-native', 'browser', 'require', 'import'];

module.exports = wrapWithReanimatedMetroConfig(config);
