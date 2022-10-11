import type { Op } from "./drawer/op"

export const base: string = "http://localhost:4800";


interface FetchOption {
  progress?: (loaded: number, total: number) => void;
  noResult?: boolean;
}

function response(promise: Promise<any>, option: FetchOption): Promise<any> {
  if( option.progress ){

  }
  if( option.noResult !== undefined && option.noResult ){
    return promise; // returns Promise<Response>
  } else {
    promise.then(resp => resp.json());
  }
}

function get(cmd: string, params: any = {}, option: FetchOption = {}): Promise<any> {
  let arg = `${base}/${cmd}`
  if (Object.keys(params).length !== 0) {
    const q = (new URLSearchParams(params)).toString()
    arg += `?${q}`
  }
  return response(fetch(arg), option);
}

function post(cmd: string, data: any, params: any = {}, option: FetchOption = {}): Promise<any> {
  let arg = `${base}/${cmd}`
  if (Object.keys(params).length !== 0) {
    const q = (new URLSearchParams(params)).toString()
    arg += `?${q}`
  }
  return response(fetch(arg, { method: "POST", body: JSON.stringify(data) }), option);
}

function del(cmd: string, data: any, params: any = {}, option: FetchOption = {}): Promise<any> {
  let arg = `${base}/${cmd}`
  if (Object.keys(params).length !== 0) {
    const q = (new URLSearchParams(params)).toString()
    arg += `?${q}`
  }
  return response(fetch(arg, { method: "DELETE" }), option);
}

export interface PrintRequest {
  setup: Op[];
  pages: Op[][];
}

export interface ScannerDevice {
  deviceId: string;
  name: string;
  description: string;
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
  },

  listScannerDevice(): Promise<ScannerDevice[]> {
    return get("scanner/device/", {});
  },

  scan(
    deviceid: string, 
    progress: (loaded: number, total: number) => void, 
    resolution: number = 100
    ): Promise<string> {
    return get("scanner/scan", { "device-id": deviceid, "resolution": resolution}, {
      progress,
      noResult: true
    }).then((resp: Response) => {
      return resp.headers.get("x-saved-image");
    });
  },

  getScannedFile(savedFile: string): Promise<ArrayBuffer> {
    return get(`scanner/image/${savedFile}`, {}, { noResult: true })
      .then(resp => resp.arrayBuffer());
  },

  deleteScannedFile(savedFile: string): Promise<boolean> {
    return del(`scanner/image/${savedFile}`, {});
  }
}

