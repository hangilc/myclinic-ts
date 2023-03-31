import api from "@/lib/api"
import FaceConfirmedWindow from "@/lib/FaceConfirmedWindow.svelte";
import { onshiFace } from "@/lib/onshi-face";

export async function faceStart() {
  const server = (await api.dictGet("onshi-server")).replace("https", "wss");
  const secret = await api.dictGet("onshi-secret");
  const ws = new WebSocket(`${server}/ws?secret=${secret}`);
  ws.addEventListener("open", (_event) => {
    console.log("onshi websocket opened");
  });

  ws.addEventListener("message", async (event) => {
    const file = event.data;
    const result = await onshiFace(file);
    const d: FaceConfirmedWindow = new FaceConfirmedWindow({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        result,
      }
    })
  });

  ws.addEventListener("error", (event) => {
    console.log("onshi websocket error", event);
  });

  ws.addEventListener("close", (_event) => {
    console.log("onshi websocket closed");
  })
}

