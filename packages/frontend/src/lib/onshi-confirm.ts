import api from "./api";
import { OnshiResult } from "onshi-result";
import type { LimitApplicationCertificateRelatedConsFlgCode } from "onshi-result/codes";
import { pad } from "./pad";

export interface OnshiKakuninQuery {
  hokensha: string,
  hihokensha: string,
  birthdate: string,
  confirmationDate: string,
  kigou: string | undefined,
  edaban: string | undefined,
  limitAppConsFlag: LimitApplicationCertificateRelatedConsFlgCode,
};

export async function onshiConfirm(
  query: OnshiKakuninQuery,
  timeout: number = 10, // seconds
): Promise<OnshiResult> {
  query = Object.assign({}, query, {
    hokensha: pad(query.hokensha, 8, "0")
  });
  const server = await api.dictGet("onshi-server");
  const secret = await api.dictGet("onshi-secret");
  const controller = new AbortController();
  const timerId = setTimeout(() => {
    console.log("timeout");
    controller.abort();
  }, timeout * 1000);
  const response = await fetch(server + "/onshi/kakunin", {
    method: "POST",
    headers: {
      "X-ONSHI-VIEW-SECRET": secret,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(query),
    signal: controller.signal
  });
  clearTimeout(timerId);
  const result = await response.json();
  console.log("query result:", JSON.stringify(result, undefined, 2));
  console.log("before OnshiResult.cast");
  try {
    return OnshiResult.cast(result);
  } catch(ex) {
    console.log(ex);
    throw ex;
  }
}

