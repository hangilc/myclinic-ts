import api from "./api";

export async function onshiPrescReport(
  kikancode: string, prescInfo: string, issueType: "電子処方箋" | "紙の処方箋"
) {
  const query: RegisterQueryBody = {
    medicalInstitutionCode: kikancode,
    prescriptionInfo: prescInfo,
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
