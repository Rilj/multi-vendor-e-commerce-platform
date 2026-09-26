module.exports = (api, options) => {
  const { pathsToModuleNameMapper } = require("ts-simple-ast");
  const { compilerOptions } = require("./tsconfig.json");
  return {
    preset: "ts-jest",
    testEnvironment: "node",
    moduleNameMapper: {
      "^@/(.*)$": "<rootDir>/src/$1",
    },
  };
};
