import type { Op } from "./drawer/op"

export const base: string = "http://localhost:4800";

function get(cmd: string, params: any = {}): Promise<any> {
  let arg = `${base}/${cmd}`
  if (Object.keys(params).length !== 0) {
    const q = (new URLSearchParams(params)).toString()
    arg += `?${q}`
  }
  return fetch(arg).then(resp => resp.json());
}

function post(cmd: string, data: any, params: any = {}): Promise<any> {
  let arg = `${base}/${cmd}`
  if (Object.keys(params).length !== 0) {
    const q = (new URLSearchParams(params)).toString()
    arg += `?${q}`
  }
  return fetch(arg, { method: "POST", body: JSON.stringify(data) })
    .then(resp => resp.json());
}

function del(cmd: string, data: any, params: any = {}): Promise<any> {
  let arg = `${base}/${cmd}`
  if (Object.keys(params).length !== 0) {
    const q = (new URLSearchParams(params)).toString()
    arg += `?${q}`
  }
  return fetch(arg, { method: "DELETE" }).then(resp => resp.json());
}

export interface PrintRequest {
  setup: Op[],
  pages: Op[][]
}

export const printApi = {
  beep(): Promise<boolean> {
    return get("beep", {});
  },

  listPrintSetting(): Promise<string[]> {
    return get("setting/", {});
  },

  getPrintPref(kind: string): Promise<string | null> {
    return get(`pref/${kind}`, {});
  },

  setPrintPref(kind: string, pref: string): Promise<string | null> {
    return post(`pref/${kind}`, pref);
  },

  deletePrintPref(kind: string): Promise<string | null> {
    return del(`pref/${kind}`, {});
  },

  printDrawer(req: PrintRequest, setting: string = ""): Promise<boolean> {
    return post(`print/${setting}`, req);
  }
}

