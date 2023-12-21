import api from "@/lib/api"
import FaceConfirmedWindow from "@/lib/FaceConfirmedWindow.svelte";
import { onshiFace, onshiFaceArchive } from "@/lib/onshi-face";
import { hotlineTrigger } from "@/lib/event-emitter";

export async function faceStart() {
  const server = (await api.dictGet("onshi-server")).replace(/^http/, "ws");
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
        hotlineTrigger,
        onRegister: async () => {
          await onshiFaceArchive(file);
        }
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

