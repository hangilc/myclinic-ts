import Reception from "./Reception.svelte"
import { initAppEvents } from "@/app-events"
import { faceStart } from "./face";

initAppEvents();
faceStart();

const app = new Reception({
  target: document.getElementById('app') as HTMLElement
})

export default app

