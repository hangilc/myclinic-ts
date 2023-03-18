import api from "./api";
import { pad } from "./pad";
import { OnshiResult } from "onshi-result";

export async function onshiConfirm(
  hokensha: string,
  hihokensha: string,
  kigou: string | undefined,
  edaban: string | undefined,
  birthdate: string,
  confirmDate: string,
  timeout: number = 10, // seconds
): Promise<OnshiResult> {
  const server = await api.dictGet("onshi-server");
  const secret = await api.dictGet("onshi-secret");
  const q = {
    hokensha: pad(hokensha, 8, "0"),
    hihokensha,
    kigou,
    edaban,
    birthdate,
    confirmationDate: confirmDate,
  }
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
    body: JSON.stringify(q),
    signal: controller.signal
  });
  clearTimeout(timerId);
  const result = await response.json();
  console.log("query result:", JSON.stringify(result, undefined, 2));
  return OnshiResult.cast(result);
}

