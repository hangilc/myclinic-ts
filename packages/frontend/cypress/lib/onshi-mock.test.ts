import { describe, it, expect } from "vitest"
import { createOnshiResult } from "./onshi-mock";

describe("onshi-mock", () => {
  it("should provide birthdate", () => {
    const result = createOnshiResult({}, {ResultList: [{ Birthdate: "2000-01-02"}]});
    expect(result.messageBody.resultList[0].birthdate).toBe("2000-01-02");
  })});
