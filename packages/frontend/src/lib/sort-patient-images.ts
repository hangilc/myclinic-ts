import { extractPatientImageDate } from "./extract-patient-image-data";

export function sortPatientImages(list: { name: string }[]): void {
  const map: Record<string, string> = {};
  list.forEach(i => {
    const stamp = extractPatientImageDate(i.name) ?? "";
    map[i.name] = stamp;
  });
  list.sort((a, b) => -map[a.name].localeCompare(map[b.name]));
}