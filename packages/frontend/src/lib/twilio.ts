import api from "./api";

declare var Twilio: any;

let device: any = undefined;

export async function connect(phoneNumber: string): Promise<void> {
  if( device != undefined ){
    throw new Error("Phone is busy.");
  }
  const token: string = await api.getWebphoneToken();
  device = new Twilio.Device(token, { edge: "tokyo" });
  device.connect({
    params: {
      phone: phoneNumber
    }
  });
}

export function disconnect(): void {
  if( device != undefined ){
    device.disconnectAll();
    device = undefined;
  }
}
