import Reception from "./Reception.svelte"
import { initAppEvents } from "@/app-events"
import { faceStart } from "./face";
import Floating from "@/lib/Floating.svelte";

initAppEvents();
faceStart();
floating();

const app = new Reception({
  target: document.getElementById('app') as HTMLElement
})

export default app

function floating() {
  const d: Floating = new Floating({
    target:document.body,
    props: {
      destroy: () => d.$destroy(),
      title: "受付",
    }
  })
}