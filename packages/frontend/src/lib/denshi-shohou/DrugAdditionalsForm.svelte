<script lang="ts">
  import type { 薬品補足レコード } from "./presc-info";

  export let records: 薬品補足レコード[] | undefined;
  export let onEnter: (records: 薬品補足レコード[] | undefined) => void;
  let input = "";

  function doEnter() {
    input = input.trim();
    if( input ){
      const r = {
        薬品補足情報: input
      };
      let cur = records ?? [];
      cur = [...cur, r];
      records = cur;
      onEnter(cur);
      input = "";
    }
  }

  function doDelete(rec: 薬品補足レコード) {
    if( records ){
      records = records.filter(r => r !== rec);
      onEnter(records);
    }
  }

</script>
<div style="border:1px solid gray;border-radius:4px;padding:10px;margin:4px 0;">
  {#each records ?? [] as rec}
    <div>
      {rec.薬品補足情報}
      <a href="javascript:void(0)" on:click={() => doDelete(rec)}>削除</a>
    </div>
  {/each}
  <div>
    薬品補足：<input type="text" bind:value={input} />
    <button disabled={input == ""} on:click={doEnter}>追加</button>
  </div>
</div>