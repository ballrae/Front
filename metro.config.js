const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// SVG 설정 추가
defaultConfig.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
defaultConfig.resolver.assetExts = defaultConfig.resolver.assetExts.filter(ext => ext !== 'svg');
defaultConfig.resolver.sourceExts.push('svg');

const config = {
  transformer: defaultConfig.transformer,
  resolver: defaultConfig.resolver,
};

module.exports = mergeConfig(defaultConfig, config);