<script lang="ts">
  import SurfacePulldown from "@/lib/SurfacePulldown.svelte";
  import MishuuDialog from "./MishuuDialog.svelte";

  export let destroy: () => void;
  export let anchor: HTMLElement | SVGSVGElement;

  function doMishuu(): void {
    destroy();
    const d: MishuuDialog = new MishuuDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
      }
    })
  }
</script>

<SurfacePulldown {destroy} {anchor}>
  <a href="javascript:void(0)" on:click={doMishuu}>未収処理</a>
  <a href="javascript:void(0)">手書き領収書印刷</a>
</SurfacePulldown>

<style>
  a {
    margin: 4px 0;
    display: block;
  }
</style>
