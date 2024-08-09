import { getHpkiUrl, getPrescUrl } from "./cache";

export async function sign_presc(presc_info: string): Promise<string> {
  let hpkiUrl = await getHpkiUrl();
  hpkiUrl = `${hpkiUrl}/sign-presc`;
  let result = await fetch(hpkiUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ presc_info }),
  });
  if (!result.ok) {
    throw new Error(await result.text());
  }
  return result.text();
}

export async function register_presc(presc_info: string, kikancode: string, issue_type: string): Promise<String> {
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