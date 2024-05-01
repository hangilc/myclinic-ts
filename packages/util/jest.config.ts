import type {Config} from 'jest';

const config: Config = {
    preset: "ts-jest",
    testEnvironment: "node",
    testPathIgnorePatterns: ["./dist"],
    testMatch: ["**/*.test.ts"],
}

export default config;