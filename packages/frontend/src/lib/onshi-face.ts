import api from "./api";

export async function onshiFace(faceFile: string, timeout: number = 10): Promise<string> {
  const server = await api.dictGet("onshi-server");
  const secret = await api.dictGet("onshi-secret");
  const controller = new AbortController();
  const timerId = setTimeout(() => {
    console.log("timeout");
    controller.abort();
  }, timeout * 1000);
  const response = await fetch(server + "/face/" + faceFile, {
    method: "GET",
    headers: {
      "X-ONSHI-VIEW-SECRET": secret,
      "Content-Type": "application/json",
    },
    signal: controller.signal
  });
  clearTimeout(timerId);
  return await response.text();
};
