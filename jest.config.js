/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    testTimeout: 20000,
    testMatch: ["**/tests/*.test.ts"],
    watchAll: false,
    bail: true,
    transform: {
        "^.+\\.tsx?$": ["ts-jest", { tsconfig: "tsconfig.json", isolatedModules: true }],
      },
  };
  