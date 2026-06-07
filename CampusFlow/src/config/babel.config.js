// Exports the configuration function that Babel uses to compile your code
module.exports = function (api) {
  // Caches the setup to speed up subsequent app builds
  api.cache(true);
  return {
    // Uses Expo's default rules to make React Native work across all devices
    presets: ['babel-preset-expo'],
    // Allows your app to securely read hidden API keys from your .env file
    plugins: ['transform-inline-environment-variables'],
  };
};