import type {Config} from 'jest';

const config: Config = {
    preset: "ts-jest",
    testEnvironment: "node",
    testPathIgnorePatterns: ["./dist", "./futan-calc.*"],
    testMatch: ["**/*.test.ts"],
    extensionsToTreatAsEsm: [".ts"],
    transform: {
        '\.ts$': ['ts-jest', {
            "useESM": true
        }]
    }
}

export default config;