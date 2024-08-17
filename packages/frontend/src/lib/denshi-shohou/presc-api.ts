import { getHpkiUrl, getPrescUrl } from "@/lib/cache";
import type { SearchResult } from "./shohou-interface";

export async function registerPresc(presc_info: string, kikancode: string, issue_type: string): Promise<string> {
  let prescUrl = await getPrescUrl();
  let url = `${prescUrl}/register`;
  let result = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      presc_info, kikancode, issue_type
    }),
  });
  if (!result.ok) {
    throw new Error(await result.text());
  }
  return result.text();
}

export async function searchPrescribed(kikancode: string, start_date: string, end_date: string): Promise<string> {
  let prescUrl = await getPrescUrl();
  let url = `${prescUrl}/search-prescribed`;
  let result = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      kikancode,
      body: {
        DispensingResultListStartDate: start_date,
        DispensingResultListEndDate: end_date,
      }
    }),
  });
  if (!result.ok) {
    throw new Error(await result.text());
  }
  return result.text();
}

export async function searchPresc(
  kikancode: string,
  insurerNumber: string,
  insuredCardSymbol: string | undefined,
  insuredIdentificationNumber: string,
  insuredBranchNumber: string | undefined,
  issueDateFrom: string | undefined,
  issueDateTo: string | undefined,
): Promise<SearchResult> {
  let prescUrl = await getPrescUrl();
  let url = `${prescUrl}/search`;
  let result = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      kikancode,
      body: {
        InsurerNumber: insurerNumber,
        InsuredCardSymbol: insuredCardSymbol,
        InsuredIdentificationNumber: insuredIdentificationNumber,
        InsuredBranchNumber: insuredBranchNumber,
        IssueDateFrom: issueDateFrom,
        IssueDateTo: issueDateTo,
      }
    }),
  });
  if (!result.ok) {
    throw new Error(await result.text());
  }
  let json = await result.text();
  console.log("searchPresc", json);
  return JSON.parse(json) as SearchResult;
}

export async function prescStatus(
  kikancode: string,
  prescriptionId: string,
): Promise<string> {
  let prescUrl = await getPrescUrl();
  let url = `${prescUrl}/presc-status`;
  let result = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      kikancode,
      body: {
        PrescriptionId: prescriptionId,
      }
    }),
  });
  if (!result.ok) {
    throw new Error(await result.text());
  }
  let json = await result.text();
  console.log("searchPresc", json);
  return json;
}