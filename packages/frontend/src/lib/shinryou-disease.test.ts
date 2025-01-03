import { describe } from "node:test";
import { expect, it } from "vitest";
import { hasMatchingShinryouDiseases } from "./shinryou-disease";

describe("shinryou-disease", () => {
  it("should report having proper disease name", () => {
    const shinryouDiseases = [
      {
        shinryouName: "ＨｂＡ１ｃ",
        kind: "disease-check" as const,
        diseaseName: "糖尿病",
        fix: { diseaseName: "糖尿病", adjNames: ["の疑い"] },
      }
    ];
    const ctx = {
      enterDisease: async (dnames: string, anames: string[]) => {}
    }
    const result = hasMatchingShinryouDiseases(
      "ＨｂＡ１ｃ",
      ["高血圧症", "糖尿病"],
      shinryouDiseases,
      ctx
    );
    expect(result).toBe(true);
  });

  it("should report having no proper disease name", () => {
    const shinryouDiseases = [
      {
        shinryouName: "ＨｂＡ１ｃ",
        kind: "disease-check" as const,
        diseaseName: "糖尿病",
        fix: { diseaseName: "糖尿病", adjNames: ["の疑い"] },
      }
    ];
    const ctx = {
      enterDisease: async (dnames: string, anames: string[]) => {}
    }
    const result = hasMatchingShinryouDiseases(
      "ＰＳＡ",
      ["高血圧症", "糖尿病"],
      shinryouDiseases,
      ctx
    );
    expect(result).toEqual([]);
  })
});