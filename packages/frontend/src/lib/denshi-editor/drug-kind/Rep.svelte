<script lang="ts">
  import type {
    薬品コード種別,
  } from "@/lib/denshi-shohou/denshi-shohou";

  export let 薬品名称: string;
  export let 薬品コード種別: 薬品コード種別;
  export let ippanmei: string;
  export let onClick: () => void;
  export let onIppanmeiClick: () => void;
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="rep" on:click={onClick}>{薬品名称}</div>
{#if 薬品コード種別 !== "一般名コード" && ippanmei}
  <!-- svelte-ignore a11y-invalid-attribute -->
  <a
    href="javascript:void(0)"
    class="ippan-link"
    on:click={onIppanmeiClick}
    tabindex="-1">一般名有</a
  >
{/if}

<style>
  .rep {
    cursor: pointer;
  }

  .ippan-link {
    white-space: nowrap;
    font-size: 0.8em;
    border: 1px solid blue;
    padding: 1px 6px;
    border-radius: 6px;
    background: rgba(0, 0, 255, 0.05);
  }
</style>
