import api from "@/lib/api"
import { onshiFace } from "@/lib/onshi-face";

export async function faceStart() {
  const server = await (await api.dictGet("onshi-server")).replace("https", "wss");
  const secret = await api.dictGet("onshi-secret");
  const ws = new WebSocket(`${server}/ws?secret=${secret}`);
  ws.addEventListener("open", (event) => {
    console.log("onshi websocket opened");
  });

  ws.addEventListener("message", async (event) => {
    const file = event.data;
    const text = await onshiFace(file);
    // const json = parseString(text, (err, json) => {
    //   if( err ){
    //     console.log(err);
    //   } else {
    //     console.log(json);
    //   }
    // });
  });

  ws.addEventListener("error", (event) => {
    console.log("onshi websocket error", event);
  });

  ws.addEventListener("close", (event) => {
    console.log("onshi websocket closed");
  })
}