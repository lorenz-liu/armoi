/* eslint-env jest */

// The picker and storage are native; tests exercise the logic around them.
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(async () => ({ granted: true })),
  launchImageLibraryAsync: jest.fn(async () => ({ canceled: true, assets: [] })),
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'en', languageTag: 'en-US' }],
}));

// expo-image renders a native view; a plain RN Image keeps snapshots meaningful.
jest.mock('expo-image', () => {
  const { Image } = require('react-native');
  return { Image };
});

global.fetch = jest.fn();
