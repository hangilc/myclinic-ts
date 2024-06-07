import type { Op } from "@/lib/drawer/compiler/op"

export const base: string = "http://localhost:48080";

interface FetchOption {
  progress?: (loaded: number, total: number) => void;
  noResult?: boolean;
  rawString?: boolean;
  noCors?: boolean;
}

async function response(promise: Promise<Response>, option: FetchOption): Promise<any> {
  if( option.progress ){
    const resp = await promise;
    const len = parseInt(resp.headers.get("Content-length")!);
    const reader = resp.body!.getReader();
    let loaded = 0;
    while( true ){
      const { done, value } = await reader.read();
      if( done ){
        break;
      }
      loaded += value.length;
      option.progress(loaded, len);
    }
    return resp; // returns Promise<Response>
  }
  if( option.noResult !== undefined && option.noResult ){
    return promise; // returns Promise<Response>
  } else if( option.rawString ){
    const resp = await promise;
    return resp.text();
  } else {
    const resp: Response = await promise;
    if( resp.status >= 300 ){
      throw new Error(await resp.text());
    }
    return resp.json();
  }
}

function get(cmd: string, params: any = {}, option: FetchOption = {}): Promise<any> {
  let arg = `${base}/${cmd}`;
  if (Object.keys(params).length !== 0) {
    const q = (new URLSearchParams(params)).toString()
    arg += `?${q}`
  }
  return response(fetch(arg), option);
}

function post(cmd: string, data: any, params: any = {}, option: FetchOption = {}): Promise<any> {
  let arg = `${base}/${cmd}`;
  if (Object.keys(params).length !== 0) {
    const q = (new URLSearchParams(params)).toString()
    arg += `?${q}`
  }
  const fopt: any = { method: "POST", body: JSON.stringify(data) };
  if( option.noCors ){
    fopt.mode = "no-cors";
  }
  return response(fetch(arg, fopt), option);
}

function del(cmd: string, params: any = {}, option: FetchOption = {}): Promise<any> {
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

  createPrintSetting(name: string): Promise<void> {
    return post(`setting/${name}`, "", {}, { rawString: true });
  },

  deletePrintSetting(name: string): Promise<void> {
    return del(`setting/${name}`, {});
  },

  getPrintSettingDetail(name: string): Promise<any> {
    return get(`setting/${name}/detail`, {});
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

  listScannerDevices(): Promise<ScannerDevice[]> {
    return get("scanner/device/", {});
  },

  async scan(
    deviceid: string, 
    progress: (loaded: number, total: number) => void, 
    resolution: number = 100
    ): Promise<string> {
    const resp = await get("scanner/scan", { "device-id": deviceid, "resolution": resolution }, {
      progress,
      noResult: true
    });
    return resp.headers.get("x-saved-image");
  },

  async getScannedFile(savedFile: string): Promise<ArrayBuffer> {
    const resp = await get(`scanner/image/${savedFile}`, {}, { noResult: true });
    return resp.arrayBuffer();
  },

  scannedFileUrl(savedFile: string): string {
    return encodeURI(`${base}/scanner/image/${savedFile}`);
  },

  deleteScannedFile(savedFile: string): Promise<boolean> {
    return del(`scanner/image/${savedFile}`, {});
  },

}

