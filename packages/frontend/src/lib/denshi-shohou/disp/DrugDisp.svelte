<script lang="ts">
  import type { 薬品情報 } from "../presc-info";
  import { amountDisp, futanKubunDisp, unevenDisp } from "./disp-util";

  export let drug: 薬品情報;

  $: name = drug.薬品レコード.薬品名称;
  $: amount = amountDisp(drug.薬品レコード);
</script>

<div>
  <span>{name}</span>
  <span class="no-break">{amount}</span>
  {#if drug.不均等レコード}
    （{unevenDisp(drug.不均等レコード)}）
  {/if}
  <slot name="post" />
</div>
{#if drug.負担区分レコード}
  <div>{futanKubunDisp(drug.負担区分レコード)}</div>
{/if}
{#if drug.薬品補足レコード}
  {#each drug.薬品補足レコード as sup}
    <div>{sup.薬品補足情報}</div>
  {/each}
{/if}

<style>
  .no-break {
    white-space: nowrap;
  }
</style>
