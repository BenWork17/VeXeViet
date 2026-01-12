const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Disable package exports to fix node:sea error on Windows with Node 22+
if (config.resolver) {
  config.resolver.unstable_enablePackageExports = false;
}

module.exports = config;
