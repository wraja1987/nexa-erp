import type { Config } from 'jest';
const config: Config = {
  testMatch: ['**/tests/**/*.api.test.ts'],
  transform: { '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }] },
  testEnvironment: 'node',
  verbose: true,
  maxWorkers: 1,
};
export default config;




