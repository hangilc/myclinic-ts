import api from "./api";
import { OnshiResult } from "onshi-result";
import type { LimitApplicationCertificateRelatedConsFlgCode } from "onshi-result/codes";
import { pad } from "./pad";

export class LoginResponseResult {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  linkSysCharCd: string;

  constructor(accessToken: string, refreshToken: string, idToken: string, linkSysCharCd: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.idToken = idToken;
    this.linkSysCharCd = linkSysCharCd;
  }

  static cast(arg: any): LoginResponseResult {
    return new LoginResponseResult(
      arg.accessToken,
      arg.refreshToken,
      arg.idToken,
      arg.linkSysCharCd,
    )
  }
}

export class LoginResponse {
  status: string;
  msg: string;
  result: LoginResponseResult;

  constructor(status: string, msg: string, result: LoginResponseResult) {
    this.status = status;
    this.msg = msg;
    this.result = result;
  }

  static cast(arg: any): LoginResponse {
    return new LoginResponse(
      arg.status,
      arg.msg,
      LoginResponseResult.cast(arg.result),
    )
  }
}

export async function onshiLogin(timeout: number = 10): Promise<LoginResponse> { // timeout in seconds
  const server = await api.dictGet("onshi-server");
  const secret = await api.dictGet("onshi-secret");
  const controller = new AbortController();
  const timerId = setTimeout(() => {
    console.log("timeout");
    controller.abort();
  }, timeout * 1000);
  const response = await fetch(server + "/login", {
    method: "GET",
    headers: {
      "X-ONSHI-VIEW-SECRET": secret,
    },
    signal: controller.signal
  });
  clearTimeout(timerId);
  const result = await response.json();
  console.log("login result:", JSON.stringify(result, undefined, 2));
  return LoginResponse.cast(result);
}

export interface OnshiKakuninQuery {
  hokensha: string,
  hihokensha: string,
  birthdate: string,
  confirmationDate: string,
  kigou: string | undefined,
  edaban: string | undefined,
  limitAppConsFlag: LimitApplicationCertificateRelatedConsFlgCode,
  idToken?: string,
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
  } catch (ex) {
    console.log(ex);
    throw ex;
  }
}

