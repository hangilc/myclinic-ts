<script lang="ts">
  import CheckLabel from "@/lib/CheckLabel.svelte";
import Dialog from "@/lib/Dialog.svelte"
  import type { VisitEx } from "@/lib/model";

  export let kensa: Record<string, string[]>;
  export let visit: VisitEx;
  let dialog: Dialog;
  let items: Record<string, boolean>;

  $: items = [...kensa.left, ...kensa.right].map(name => ({ name, checked: false }));

  export function open(): void {
    dialog.open();
  }
</script>

<Dialog let:close={close} bind:this={dialog}>
  <span slot="title">検査入力</span>
  <div class="two-cols">
    {#each kensa.left as item}
      <div><CheckLabel label={item}/></div>
    {/each}
  </div>
  <svelte:fragment slot="commands">
    <button>入力</button>
    <button on:click={close}>キャンセル</button>
  </svelte:fragment>
</Dialog>
