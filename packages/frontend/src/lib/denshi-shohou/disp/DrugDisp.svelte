<script lang="ts">
  import type { 薬品情報 } from "../presc-info";
  import { amountDisp, futanKubunDisp, unevenDisp } from "./disp-util";

  export let drug: 薬品情報;

  $: name = drug.薬品レコード.薬品名称;
  $: amount = amountDisp(drug.薬品レコード);
</script>

<span>{name}</span>
<span class="no-break">{amount}</span>
{#if drug.不均等レコード}
  （{unevenDisp(drug.不均等レコード)}）
{/if}
{#if drug.負担区分レコード}
  {futanKubunDisp(drug.負担区分レコード)}
{/if}
{#if drug.薬品補足レコード}
  {drug.薬品補足レコード.map((rec) => rec.薬品補足情報).join(" ")}
{/if}

<style>
  .no-break {
    white-space: nowrap;
  }
</style>
