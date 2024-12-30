<script lang="ts">
  import type { 薬品補足区分 } from "./denshi-shohou";
  import type { 薬品補足レコード } from "./presc-info";

  export let records: 薬品補足レコード[] | undefined;
  export let onEnter: (records: 薬品補足レコード[] | undefined) => void;
  let kubun: 薬品補足区分 | "undefined" = "undefined";
  let input = "";

  function doEnter() {
    input = input.trim();
    if (input) {
      const r: 薬品補足レコード = {
        薬品補足情報: kubun === "undefined" ? input : kubun,
      };
      let cur = records ?? [];
      cur = [...cur, r];
      records = cur;
      onEnter(cur);
      input = "";
    }
  }

  function doDelete(rec: 薬品補足レコード) {
    if (records) {
      records = records.filter((r) => r !== rec);
      onEnter(records);
    }
  }

  function onKubunChange() {
    if (kubun === "undefined") {
      input = "";
    } else {
      input = kubun;
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
    <div style="max-width:400px;">
      <span style="white-space:nowrap"
        ><input
          type="radio"
          bind:group={kubun}
          value="一包化"
          on:change={onKubunChange}
        /> 一包化</span
      >
      <span style="white-space:nowrap"
        ><input
          type="radio"
          bind:group={kubun}
          value="粉砕"
          on:change={onKubunChange}
        /> 粉砕</span
      >
      <span style="white-space:nowrap"
        ><input
          type="radio"
          bind:group={kubun}
          value="後発品変更不可"
          on:change={onKubunChange}
        /> 後発品変更不可</span
      >
      <span style="white-space:nowrap"
        ><input
          type="radio"
          bind:group={kubun}
          value="剤形変更不可"
          on:change={onKubunChange}
        /> 剤形変更不可</span
      >
      <span style="white-space:nowrap"
        ><input
          type="radio"
          bind:group={kubun}
          value="含量規格変更不可"
          on:change={onKubunChange}
        /> 含量規格変更不可</span
      >
      <span style="white-space:nowrap"
        ><input
          type="radio"
          bind:group={kubun}
          value="剤形変更不可及び含量規格変更不可"
          on:change={onKubunChange}
        /> 剤形変更不可及び含量規格変更不可</span
      >
      <span style="white-space:nowrap"
        ><input
          type="radio"
          bind:group={kubun}
          value="先発医薬品患者希望"
          on:change={onKubunChange}
        /> 先発医薬品患者希望</span
      >
      <span style="white-space:nowrap"
        ><input
          type="radio"
          bind:group={kubun}
          value="undefined"
          on:change={onKubunChange}
        /> 区分なし</span
      >
    </div>
    {#if kubun === "undefined"}
      <div>
        薬品補足：<input type="text" bind:value={input} />
      </div>
    {/if}
    <div>
      <button disabled={kubun === "undefined" && input === ""} on:click={doEnter}>追加</button>
    </div>
  </div>
</div>
