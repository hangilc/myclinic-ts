<script lang="ts">
  import type { 負担区分レコード } from "../presc-info";

  export let kouhiCount: number;
  export let 負担区分レコード: 負担区分レコード | undefined;
  export let onDone: (value: 負担区分レコード | undefined) => void;
  let kouhi1Checked = false;
  let kouhi2Checked = false;
  let kouhi3Checked = false;

  if( 負担区分レコード ) {
    kouhi1Checked = 負担区分レコード.第一公費負担区分 ?? false;
    kouhi2Checked = 負担区分レコード.第二公費負担区分 ?? false;
    kouhi3Checked = 負担区分レコード.第三公費負担区分 ?? false;
  }

  function doEnter() {
    if( kouhi1Checked || kouhi2Checked || kouhi3Checked ){
      const rec: 負担区分レコード = { };
      if( kouhiCount >= 1 && kouhi1Checked){
        rec.第一公費負担区分 = kouhi1Checked;
      }
      if( kouhiCount >= 2 && kouhi2Checked){
        rec.第二公費負担区分 = kouhi2Checked;
      }
      if( kouhiCount >= 3 && kouhi3Checked){
        rec.第三公費負担区分 = kouhi3Checked;
      }
      onDone(rec);
    } else {
      onDone(undefined);
    }
  }
</script>
{#if kouhiCount >= 1}
  <input type="checkbox" bind:checked={kouhi1Checked} />第一公費対象
{/if}
{#if kouhiCount >= 2}
  <input type="checkbox" bind:checked={kouhi2Checked} />第二公費対象
{/if}
{#if kouhiCount >= 3}
  <input type="checkbox" bind:checked={kouhi3Checked} />第三公費対象
{/if}
<div style="margin-top:6px;">
  <button on:click={doEnter}>設定</button>
</div>

