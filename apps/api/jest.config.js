/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: "src",
  testMatch: ["**/__tests__/**/*.test.ts"],
  setupFiles: ["<rootDir>/test/setupEnv.ts"],
  testTimeout: 30000,
  forceExit: true,
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      { tsconfig: { types: ["jest", "node"] } },
    ],
  },
};
