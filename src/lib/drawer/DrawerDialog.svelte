<script lang="ts">
  
  import Dialog from "../Dialog.svelte"
  import DrawerSvg from "./DrawerSvg.svelte"
  import type { Op } from "./op"

  export let ops: Op[];
  export let svgViewBox: string;
  export let svgWidth: string;
  export let svgHeight: string;
  export let title: string = "プレビュー";
  let dialog: Dialog;
  export function open(): void {
    dialog.open();
  }
  export let onClose: () => void = () => {};

</script>

<Dialog let:close={close} bind:this={dialog} width="" onClose={onClose}>
  <span slot="title">{title}</span>
  <DrawerSvg ops={ops} viewBox={svgViewBox} width={svgWidth} height={svgHeight} />
</Dialog>