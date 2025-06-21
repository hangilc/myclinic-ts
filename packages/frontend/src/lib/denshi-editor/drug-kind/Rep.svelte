<script lang="ts">
  import type { 薬品コード種別 } from "@/lib/denshi-shohou/denshi-shohou";
  import Link from "../widgets/Link.svelte";

  export let 薬品名称: string;
  export let 薬品コード種別: 薬品コード種別;
  export let ippanmei: string;
  export let onClick: () => void;
  export let onIppanmeiClick: () => void;
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="top">
  <div class="label">薬品名称</div>
  <span class="rep" on:click={onClick}>{薬品名称}</span>

  <div class="label">一般名</div>
  {#if 薬品コード種別 === "一般名コード"}
    <span>一般名</span>
  {:else if ippanmei}
    <span>一般名有り</span>
    <Link onClick={onIppanmeiClick}>一般名に変更</Link>
  {:else}
    <span>一般名なし</span>
  {/if}
</div>

<style>
  .top {
    vertical-align: middle;
  }

  .rep {
    cursor: pointer;
  }

  .label {
    font-weight: bold;
    color: #999;
    font-size: 12px;
  }

  .label ~ .label {
    margin-top: 6px;
  }
</style>
