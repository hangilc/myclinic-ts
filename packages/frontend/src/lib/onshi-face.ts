import api from "./api";
import { XMLParser } from "fast-xml-parser";
import { OnshiResult } from "onshi-result";
import { XmlMsg } from "onshi-result/XmlMsg";

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
  const parser = new XMLParser();
  const json = parser.parse(xml);
  if( !Array.isArray(json.XmlMsg.MessageBody.ResultList) ){
    json.XmlMsg.MessageBody.ResultList = [json.XmlMsg.MessageBody.ResultList];
  }
  console.log(json);
  const xmlMsg = XmlMsg.cast(json.XmlMsg);
  return new OnshiResult(xmlMsg, json);
}

