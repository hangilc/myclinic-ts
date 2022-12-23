<script lang="ts">
  import SurfacePulldown from "@/lib/SurfacePulldown.svelte";

  export let destroy: () => void;
  export let anchor: HTMLElement | SVGSVGElement;
  export let onEnter: (kind: string) => void;

  let kindMap: Record<string, string> = {
    保険証: "hokensho",
    健診結果: "health-check",
    検査結果: "exam-report",
    紹介状: "refer",
    訪問看護指示書など: "shijisho",
    訪問看護などの報告書: "zaitaku",
    その他: "image",
  };

  function doKey(key: string): void {
    const kind = kindMap[key];
    if( kind != null ){
      destroy();
      onEnter(kind);
    }
  }
</script>

<SurfacePulldown {destroy} {anchor} >
  {#each Object.keys(kindMap) as k}
    <a href="javascript:void(0)" on:click={() => doKey(k)}>{k}</a>
  {/each}
</SurfacePulldown>

<style>
  a {
    display: block;
    margin-bottom: 6px;
  }

  a:last-of-type {
    margin-bottom: 0;
  }
</style>
