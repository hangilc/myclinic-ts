import AppoiontMain from "./AppointMain.svelte"
import { initAppEvents } from "@/app-events"
import { parseLocationQuery } from "@/lib/parse-location-query";
import { isAdmin, setIsAdmin } from "./appoint-vars";

initAppEvents();

const query = parseLocationQuery();
setIsAdmin(query["admin"] === "true");
console.log(isAdmin);
const app = new AppoiontMain({
  target: document.getElementById('app') as HTMLElement
})

export default app