import Practice from "./Practice.svelte"
import { initAppEvents } from "./app-events"

initAppEvents();

const app = new Practice({
  target: document.getElementById('app')
})

export default app