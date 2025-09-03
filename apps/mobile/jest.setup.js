jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(async () => {}),
  getItem: jest.fn(async () => null),
  removeItem: jest.fn(async () => {}),
}))

// Polyfill setImmediate used by react-native-screens in tests
if (typeof global.setImmediate === 'undefined') {
  // eslint-disable-next-line no-undef
  // @ts-ignore
  global.setImmediate = (fn, ...args) => setTimeout(fn, 0, ...args)
}



