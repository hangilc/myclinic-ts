import api from "./api";
import * as Base64 from "js-base64";

export async function onshiPrescReport(
  kikancode: string, prescInfo: string, issueType: "電子処方箋" | "紙の処方箋"
) {
  let qinfo = queryPrescInfo(prescInfo);
  const query: RegisterQueryBody = {
    medicalInstitutionCode: kikancode,
    prescriptionInfo: qinfo,
    issueType: issueType === "電子処方箋" ? "1" : "2",
  }
  const server = await api.dictGet("onshi-server");
  const secret = await api.dictGet("onshi-secret");
  const controller = new AbortController();
  let timeout = 10;
  const timerId = setTimeout(() => {
    console.log("timeout");
    controller.abort();
  }, timeout * 1000);
  const response = await fetch(server + "/presc/report", {
    method: "POST",
    headers: {
      "X-ONSHI-VIEW-SECRET": secret,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(query),
    signal: controller.signal
  });
  const result = await response.json();
  clearTimeout(timerId);
  console.log(result);
}

interface RegisterQueryBody {
  medicalInstitutionCode: string;
  arbitraryFileIdentifier?: string;
  prescriptionInfo: string;
  issueType: string; // "1": 電子処方箋, "2": 紙の処方箋
  idToken?: string;
}


function queryPrescInfo(prescInfo: string): string {
  console.log("prescInfo", prescInfo);
  let base64PrescInfo = base64Encode(prescInfo);
  const query = `<?xml version="1.0" encoding="UTF-8"?><Document xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" id="Document" xsi:noNamespaceSchemaLocation="EP.xsd"><Prescription><PrescriptionManagement id="PrescriptionManagement"><Version Value="EPS1.0"/></PrescriptionManagement><PrescriptionDocument id="PrescriptionDocument">${base64PrescInfo}</PrescriptionDocument></Prescription></Document>`;
  return base64Encode(query);
}

function base64Encode(src: string): string {
  let te = new TextEncoder();
  let bytes = te.encode(src);
  let encoded =  Base64.fromUint8Array(bytes);
  let bs = Base64.toUint8Array(encoded);
  let decoded = (new TextDecoder()).decode(bs);
  console.log(decoded);
  return encoded;
}

