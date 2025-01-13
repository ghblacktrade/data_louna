/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type {Config} from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  // silent: true,
  // verbose: false,
  // noStackTrace: true,
  // skipNodeResolution: true,

  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/../tsconfig.json',
      },
    ],
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/$1',
    '@src/(.*)$': '<rootDir>/$1',
  },

  // setupFilesAfterEnv: ['<rootDir>/../jest.setup.ts'], // если у тебя есть файл с настройками для Jest
};

export default config;
