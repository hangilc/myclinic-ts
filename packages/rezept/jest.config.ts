import type {Config} from 'jest';

const config: Config = {
    preset: "ts-jest",
    testEnvironment: "node",
    testPathIgnorePatterns: ["./dist", "./futan-calc.*"],
}

export default config;