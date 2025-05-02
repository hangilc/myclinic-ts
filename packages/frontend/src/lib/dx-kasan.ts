export interface DxKasanApplied {
  validFrom: string;
  level: number;
}

export function resolveDxKasanLevel(series: DxKasanApplied[], date: string): number | undefined {
  console.log("enter resolve", date);
  for (let spec of series) {
    if (spec.validFrom <= date) {
      return spec.level;
    }
  }
  return undefined;
}

export function validateDxKasanApplied(arg: any): DxKasanApplied {
  if (typeof arg !== "object") {
    throw new Error("is not object");
  }
  let validFrom = arg["validFrom"];
  if (validFrom == undefined) {
    throw new Error("cannot find property: validFrom");
  }
  if (typeof validFrom !== "string") {
    throw new Error("invalid type of validFrom property");
  }
  let level = arg["level"];
  if (level == undefined) {
    throw new Error("cannot find property: level");
  }
  if (typeof level !== "number") {
    throw new Error("invalid typeof level property");
  }
  return { validFrom, level }
}

export function validateDxKasanSeries(arg: any): DxKasanApplied[] {
  if (!Array.isArray(arg)) {
    throw new Error("is not array");
  }
  let result: DxKasanApplied[] = [];
  for (let ele of arg) {
    result.push(validateDxKasanApplied(ele));
  }
  return result;
}
