<script lang="ts">
  
  import Dialog from "../Dialog.svelte"
  import DrawerSvg from "./DrawerSvg.svelte"
  import type { Op } from "./op"

  export let ops: Op[];
  let dialog: Dialog;
  export function open(): void {
    dialog.open();
  }

</script>

<Dialog let:close={close} bind:this={dialog}>
  <DrawerSvg ops={ops} />
</Dialog>