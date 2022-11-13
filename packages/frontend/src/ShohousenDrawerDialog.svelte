<script lang="ts">
  import DrawerDialog from "@/lib/drawer/DrawerDialog.svelte"
  import type { Op } from "@/lib/drawer/op"

  let dialog: DrawerDialog;
  export function open(): void {
    dialog.open();
  }
  export let ops: Op[];
  export let scale: number = 3;
  export let onClose: () => void = () => {};

</script>

<DrawerDialog bind:this={dialog} ops={ops} kind="shohousen" svgViewBox="0 0 148 210" 
  svgWidth={(148*scale).toString()} svgHeight={(210*scale).toString()}
  title="処方箋印刷" onClose={onClose} />
