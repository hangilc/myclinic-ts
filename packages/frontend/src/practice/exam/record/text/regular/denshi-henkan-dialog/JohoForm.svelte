<script lang="ts">
  import CheckCircle from "@/icons/CheckCircle.svelte";
  import XCircle from "@/icons/XCircle.svelte";
  import type {
    提供情報レコード,
    提供診療情報レコード,
    検査値データ等レコード,
  } from "@/lib/denshi-shohou/presc-info";

  export let joho: 提供情報レコード | undefined;
  export let onDone: (rec: 提供情報レコード | undefined) => void;
  export let onCancel: () => void;

  let drugInput = "";
  let shinryouInput = "";
  let kensaInput = "";
  let shinryouList: 提供診療情報レコード[] = joho?.提供診療情報レコード ?? [];
  let kensaList: 検査値データ等レコード[] = joho?.検査値データ等レコード ?? [];

  function toRecord(
    slist: 提供診療情報レコード[],
    klist: 検査値データ等レコード[]
  ): 提供情報レコード | undefined {
    if (slist.length === 0 && klist.length === 0) {
      return undefined;
    } else {
      return {
        提供診療情報レコード: slist.length > 0 ? slist : undefined,
        検査値データ等レコード: klist.length > 0 ? klist : undefined,
      };
    }
  }

  function addShinryou() {
    const d = drugInput.trim();
    const t = shinryouInput.trim();
    if (t !== "") {
      const rec = toRecord([...shinryouList, { 
        薬品名称: d !== "" ? d : undefined,
        コメント: t 
      }], kensaList);
      onDone(rec);
    }
  }

  function addKensa() {
    const t = kensaInput.trim();
    if (t !== "") {
      const rec = toRecord(shinryouList, [...kensaList, { 検査値データ等: t }]);
      onDone(rec);
    }
  }
</script>

<div style="font-weight:bold;">提供情報</div>
<div>診療情報：</div>
<div>
  {#each shinryouList as shinryou}
    <div>
      {#if shinryou.薬品名称}（{shinryou.薬品名称}）
      {/if}
      {shinryou.コメント}
    </div>
  {/each}
  <div>
    <div>
      <input type="text" bind:value={drugInput} />
    </div>
    <div style="margin-top:3px;">
      <input type="text" bind:value={shinryouInput} />
      <a
        href="javascript:void(0)"
        style="position:relative;top:3px"
        on:click={addShinryou}
      >
        <CheckCircle color="blue" />
      </a>
      <a
        href="javascript:void(0)"
        style="position:relative;top:3px"
        on:click={onCancel}
      >
        <XCircle />
      </a>
    </div>
  </div>
</div>
<div style="margin-top:10px;">検査値：</div>
<div>
  {#each kensaList as kensa}
    <div>{kensa.検査値データ等}</div>
  {/each}
  <div>
    <input type="text" bind:value={kensaInput} />
    <a
      href="javascript:void(0)"
      style="position:relative;top:3px"
      on:click={addKensa}
    >
      <CheckCircle color="blue" />
    </a>
    <a
      href="javascript:void(0)"
      style="position:relative;top:3px"
      on:click={onCancel}
    >
      <XCircle />
    </a>
  </div>
</div>
