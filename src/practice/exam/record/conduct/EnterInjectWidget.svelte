<script lang="ts">
  import type { VisitEx } from "@/lib/model";
  import Widget from "@/lib/Widget.svelte"

  let widget: Widget;
  export let visit: VisitEx;

  export function open(): void {
    widget.open();
  }

  async function doEnter() {
    
  }

</script>

<Widget title="注射処置入力" let:close={close} bind:this={widget}>
  <svelte:fragment slot="commands">
    <button on:click={doEnter}>入力</button>
    <button on:click={close}>キャンセル</button>
  </svelte:fragment>
</Widget>