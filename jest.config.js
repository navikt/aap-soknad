/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  modulePathIgnorePatterns: [
    'server',
    // Problemer med typescript i testene under. Ignoreres til vi har løst dette.
    // TODO: Fiks tester
    'src/pages/standard/Student',
    'src/pages/standard/Veiledning/',
    'src/pages/standard/StartDato/StartDato.test.tsx',
    'src/pages/standard/Yrkesskade/',
  ],
  moduleNameMapper: { '\\.(css)$': '<rootDir>/src/mocks/styleMock.ts' },
  transform: {
    '.+\\.(css|styl|sass|scss)$': 'jest-css-modules-transform',
  },
  setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
};
