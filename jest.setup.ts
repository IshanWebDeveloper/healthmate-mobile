/**
 * Icon fonts are bundled assets that don't exist under Jest, so expo-font would
 * fail to load them. Report fonts as already loaded; rendering is unaffected.
 */
jest.mock('expo-font', () => ({
  ...jest.requireActual('expo-font'),
  isLoaded: jest.fn(() => true),
  loadAsync: jest.fn(() => Promise.resolve()),
}));
