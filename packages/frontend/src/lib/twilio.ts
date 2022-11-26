import { createTypeReferenceDirectiveResolutionCache } from "typescript";
import api from "./api";

declare var Twilio: any;

let call: any = undefined;

export async function connect(phoneNumber: string) {
  if( call == undefined ){
    const token: string = await api.getWebphoneToken();
    const device = new Twilio.Device(token, { edge: "tokyo" });
    device.on("error", (err: any) => {
      console.error(err);
    })
    call = await device.connect({
      params: {
        phone: phoneNumber
      }
    });
    call.on("error", (err: any) => {
      console.error(err);
    })
    call.on("disconnect", () => {
      console.log("call disconnected.");
      call = undefined;
    })
  }
}

export function disconnect(): void {
  if( call ){
    call.disconnect();
    call = undefined;
  }
}
