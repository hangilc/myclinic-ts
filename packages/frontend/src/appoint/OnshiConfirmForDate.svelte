<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import type { AppointTimeData } from "./appoint-time-data";
  import type { Appoint } from "myclinic-model";
  import OnshiConfirmItem from "./OnshiConfirmItem.svelte";
  import { writable, type Writable } from "svelte/store";
  import { onshiLogin } from "@/lib/onshi-confirm";

  export let destroy: () => void;
  export let date: string;
  export let siblings: AppointTimeData[];
  const appoints: Appoint[] = siblings.flatMap((sib) => sib.appoints);
  let numConfirmed: number = 0;
  const idToken: Writable<string | undefined> = writable(undefined);

  login();

  async function login() {
    const resp = await onshiLogin();
    idToken.set(resp.result.idToken);
  }

  function doClose() {
    destroy();
  }
</script>

<Dialog destroy={doClose} title="保険証資格確認">
  <div
    class={numConfirmed < appoints.length
      ? "confirm-in-progress"
      : ""}
  >
    {numConfirmed} / {appoints.length}
  </div>
  <div class="wrapper">
    {#each appoints as appoint (appoint.appointId)}
      <OnshiConfirmItem {appoint} {date} {idToken} onDone={() => numConfirmed += 1}/>
    {/each}
  </div>
</Dialog>

<style>
  .wrapper {
    max-height: 400px;
    overflow-y: auto;
  }

  .confirm-in-progress {
    color: red;
  }
</style>
