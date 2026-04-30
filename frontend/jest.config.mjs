import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./"
});

const customJestConfig = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy"
  },
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],
  collectCoverageFrom: [
    "components/**/*.{js,jsx}",
    "contexts/**/*.{js,jsx}",
    "hooks/**/*.{js,jsx}",
    "lib/**/*.{js,jsx}"
  ]
};

export default createJestConfig(customJestConfig);
