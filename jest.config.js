/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: [
    "**/__tests__/**/*.test.(js|ts|jsx|tsx)", 
    "**/*.test.(js|ts|jsx|tsx)"
  ],
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react-jsx",
          module: "commonjs",
          target: "es2017",
        },
      },
    ],
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  collectCoverageFrom: ["src/**/*.{js,jsx,ts,tsx}", "!src/**/*.d.ts"],
  testTimeout: 10000,
  testEnvironmentOptions: {
    customExportConditions: [""],
  },
};

module.exports = config;
