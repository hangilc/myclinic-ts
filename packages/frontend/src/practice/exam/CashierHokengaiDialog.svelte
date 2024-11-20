<script lang="ts">
  import api from "@/lib/api";
  import { cache } from "@/lib/cache";
  import Dialog from "@/lib/Dialog.svelte";

  export let destroy: (s: string | undefined) => void;
  let name = "";
  let history: string[] = [];

  init();

  async function init() {
    history = await cache.getHokengaiHistory();
  }

  async function doEnter() {
    if( !history.includes(name) ){
      history.push(name);
      await api.setHokengaiHistory(history);
      cache.clearHokengaiHistory();
    }
    destroy(name);
  }

  function doCancel() {
    destroy(undefined);
  }
</script>

<Dialog title="自費保険外項目" destroy={doCancel}>
  <div>
    <input type="text" bind:value={name} />
    <button on:click={doEnter}>入力</button>
    <button on:click={doCancel}>キャンセル</button>
  </div>
  <div style="margin-top:10px;max-height:300px;overflow-y:auto;">
    {#each history as h}
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div on:click={() => name = h} style="cursor:pointer;">{h}</div>
    {/each}
  </div>
</Dialog>