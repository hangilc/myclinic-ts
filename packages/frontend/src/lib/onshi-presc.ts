import api from "./api";

export async function reportPresc(shohou: string) {
  const server = await api.dictGet("onshi-server");
  const secret = await api.dictGet("onshi-secret");
  const controller = new AbortController();
  let timeout = 10; // 10 seconds
  const timerId = setTimeout(() => {
    console.log("timeout");
    controller.abort();
  }, timeout * 1000);
  const response = await fetch(server + "/presc/report", {
    method: "POST",
    headers: {
      "X-ONSHI-VIEW-SECRET": secret,
      "Content-Type": "text/plain",
    },
    body: shohou,
    signal: controller.signal
  });
  clearTimeout(timerId);
  return await response.text();
}
