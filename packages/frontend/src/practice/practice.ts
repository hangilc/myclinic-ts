import Practice from "./Practice.svelte"
import { initAppEvents } from "@/app-events"

initAppEvents();

if( window ){
  window.addEventListener("keydown", (e: KeyboardEvent) => {
    if( (e.key === "p" || e.key === "P") && e.ctrlKey ){
      e.preventDefault();
    }
  });
}

const app = new Practice({
  target: document.getElementById('app') as HTMLElement
})

export default app