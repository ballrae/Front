module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: ['./src/assets/fonts/'], // 폰트 경로가 있다면
  dependencies: {
    // 개발 모드에서만 필요한 의존성들 제외
    ...(process.env.NODE_ENV === 'production' && {
      'react-native-flipper': {
        platforms: {
          android: {
            sourceDir: '../node_modules/react-native-flipper/android/',
            packageImportPath: 'import com.facebook.flipper.ReactNativeFlipper;',
          },
        },
      },
    }),
  },
};
