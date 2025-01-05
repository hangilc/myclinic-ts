import { cache } from "../cache";

async function getBunshoUrl(): Promise<string> {
  let prescUrl = await cache.getPrescUrl();
  const i = prescUrl.indexOf("/presc");
  return prescUrl.substring(0, i) + "/bunsho";
}

export async function queryInstituteEnv(kikancode: string): Promise<string> {
  let baseUrl = await getBunshoUrl();
  let url = `${baseUrl}/query-institute-env`;
  let result = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", "X-ONSHI-VIEW-SECRET": await cache.getOnshiViewSecret() },
    body: JSON.stringify({
      kikancode,
    }),
  });
  if (!result.ok) {
    throw new Error(await result.text());
  }
  return result.text();
}

export async function listBunshoToOwn(dateFrom: string, dateTo: string): Promise<string> {
  let baseUrl = await getBunshoUrl();
  let url = `${baseUrl}/list-bunsho-to-own`;
  let result = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", "X-ONSHI-VIEW-SECRET": await cache.getOnshiViewSecret() },
    body: JSON.stringify({
      CreateDateFrom: dateFrom,
      CreateDateTo: dateTo,
    }),
  });
  if (!result.ok) {
    throw new Error(await result.text());
  }
  return result.text();
}
