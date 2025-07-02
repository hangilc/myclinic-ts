<script lang="ts">
  import { drawRyouyouhiDouisho, mkRyouyouhiDouishoDrawerData } from "@/lib/drawer/forms/ryouyouhi-douisho/ryouyouhi-douisho-drawer";
  import DrawerDialog from "@/lib/drawer/DrawerDialog.svelte";

  export let isVisible: boolean;

  function doPrint() {
    let data = mkRyouyouhiDouishoDrawerData();
    let ops = drawRyouyouhiDouisho(data);
    const d: DrawerDialog = new DrawerDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        ops,
        scale: 2,
      },
    });
  }
</script>

{#if isVisible}
<button on:click={doPrint}>印刷</button>
{/if}