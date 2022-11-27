import Reception from "./Reception.svelte"
import { initAppEvents } from "@/app-events"

initAppEvents();

const app = new Reception({
  target: document.getElementById('app') as HTMLElement
})

export default app