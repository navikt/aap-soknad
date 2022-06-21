/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  modulePathIgnorePatterns: ['server'],
  moduleNameMapper: { '\\.(css)$': '<rootDir>/src/mocks/styleMock.ts' },
  transform: {
    '.+\\.(css|styl|sass|scss)$': 'jest-css-modules-transform',
  },
  setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
};
