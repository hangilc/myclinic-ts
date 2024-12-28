<script lang="ts">
  import type { 提供情報レコード, 提供診療情報レコード } from "./presc-info";

  export let record: 提供情報レコード;
  export let onEnter: (record: 提供情報レコード | undefined) => void;
  let shinryouDrugInput = "";
  let shinryouCommentInput = "";
  let kensaInput = "";

  function doEnterShinryou() {
    shinryouCommentInput = shinryouCommentInput.trim();
    if (shinryouCommentInput !== "") {
      const s = {
        薬品名称: shinryouDrugInput === "" ? undefined : shinryouDrugInput,
        コメント: shinryouCommentInput,
      };
      let ss: 提供診療情報レコード[] = record.提供診療情報レコード ?? [];
      ss = [...ss];
      ss.push(s);
      const newRec = Object.assign({}, record, {
        提供診療情報レコード: ss,
      });
      onEnter(newRec);
    }
  }

  function doDeleteShinryou(s: 提供診療情報レコード) {
    let ss: 提供診療情報レコード[] = record.提供診療情報レコード ?? [];
    ss = ss.filter((ele) => ele !== s);
    record.提供診療情報レコード = ss;
    onEnter(record);
  }

  function doEnterKensa() {
    kensaInput = kensaInput.trim();
    if (kensaInput !== "") {
      let ks = record.検査値データ等レコード ?? [];
      ks = [...ks];
      ks.push({ 検査値データ等: kensaInput });
      record.検査値データ等レコード = ks;
      onEnter(record);
    }
  }
</script>

<div style="border:1px solid gray;border-radius:4px;padding:10px;margin:4px 0;">
  {#each record.提供診療情報レコード ?? [] as rec}
    <div>
      {#if rec.薬品名称}（{rec.薬品名称}）{/if}
      {rec.コメント}
      <a href="javascript:void(0)" on:click={() => doDeleteShinryou(rec)}
        >削除</a
      >
    </div>
  {/each}
  <div>
    <div style="display:grid;grid-template-columns:auto 1fr;gap:4px;">
      <div style="text-align:right">薬品名：</div>
      <div><input type="text" bind:value={shinryouDrugInput} /> (optional)</div>
      <div style="text-align:right">コメント：</div>
      <div>
        <input type="text" bind:value={shinryouCommentInput} />
        <button disabled={!shinryouCommentInput} on:click={doEnterShinryou}
          >追加</button
        >
      </div>
    </div>
  </div>
  <hr />
  {#each record.検査値データ等レコード ?? [] as rec}
    <div>{rec.検査値データ等}</div>
  {/each}
  <div>
    検査値等：<input type="text" bind:value={kensaInput} />
    <button on:click={doEnterKensa}>追加</button>
  </div>
</div>
