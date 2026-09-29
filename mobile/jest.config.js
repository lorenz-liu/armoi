/** Jest runs against the Expo preset so RN and expo-* modules resolve. */
const expoPreset = require('jest-expo/jest-preset');

module.exports = {
  ...expoPreset,
  setupFilesAfterEnv: [...(expoPreset.setupFilesAfterEnv ?? []), '<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    // Merge rather than replace: the preset maps React Native's own internals.
    ...expoPreset.moduleNameMapper,
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@testing-library/react-native))',
  ],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/data/categories.ts'],
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/test-utils/'],
};
