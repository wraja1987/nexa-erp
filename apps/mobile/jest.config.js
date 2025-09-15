module.exports = {
  preset: "jest-expo",
  testTimeout: 30000,
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"]
};
