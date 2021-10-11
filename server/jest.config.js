module.exports = {
  roots: ["<rootDir>/src/", "<rootDir>/__tests__/"],
  // modulePaths: [
  //   "<rootDir>/src",
  //   "<rootDir>/src/auth"
  // ],
  // moduleDirectories: [
  //   "node_modules",
  //   "src"
  // ],
  moduleNameMapper: {
    "^jose/(.*)$": "<rootDir>/node_modules/jose/dist/node/cjs/$1",
  },
  transform: {
    "^.+\\.tsx?$": "ts-jest"
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  verbose: true,
  collectCoverage: true,
  testEnvironment: "node",
  coverageReporters: ["json", "lcov", "text", "clover"] // "text-summary"
};
