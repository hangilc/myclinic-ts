import api from "./api";
import { XMLParser } from "fast-xml-parser";
import { OnshiResult } from "onshi-result";

export async function onshiFace(faceFile: string, timeout: number = 10): Promise<OnshiResult> {
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
  return parseFaceXml(await response.text());
};

export function parseFaceXml(xml: string): OnshiResult {
  const parser = new XMLParser({
    numberParseOptions: {
      leadingZeros: true,
      hex: false,
      skipLike: /\d+/,
    }
  });
  const json = parser.parse(xml) as any;
  if (!Array.isArray(json.XmlMsg.MessageBody.ResultList)) {
    json.XmlMsg.MessageBody.ResultList = [json.XmlMsg.MessageBody.ResultList];
  }
  return OnshiResult.cast(json);
}

export interface OnshiFaceConfirmed {
  name: string;
  fileName: string;
  createdAt: string;
}

export async function onshiFaceList(timeout: number = 10): Promise<OnshiFaceConfirmed[]> {
  const server = await api.dictGet("onshi-server");
  const secret = await api.dictGet("onshi-secret");
  const controller = new AbortController();
  const timerId = setTimeout(() => {
    console.log("timeout");
    controller.abort();
  }, timeout * 1000);
  const response = await fetch(server + "/face", {
    method: "GET",
    headers: {
      "X-ONSHI-VIEW-SECRET": secret,
    },
    signal: controller.signal
  });
  clearTimeout(timerId);
  return await response.json();
}

export async function onshiFaceArchive(face: String, timeout: number = 10): Promise<boolean> {
  const server = await api.dictGet("onshi-server");
  const secret = await api.dictGet("onshi-secret");
  const controller = new AbortController();
  const timerId = setTimeout(() => {
    console.log("timeout");
    controller.abort();
  }, timeout * 1000);
  const response = await fetch(server + "/face/move-to-archive/" + face, {
    method: "GET",
    headers: {
      "X-ONSHI-VIEW-SECRET": secret,
    },
    signal: controller.signal
  });
  clearTimeout(timerId);
  const json = await response.json();
  return json === true;
}

