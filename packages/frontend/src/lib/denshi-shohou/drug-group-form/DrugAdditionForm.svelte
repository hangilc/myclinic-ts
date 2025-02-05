<script lang="ts">
  import XCircle from "@/icons/XCircle.svelte";
  import type { 薬品補足区分 } from "../denshi-shohou";
  import type { 薬品補足レコード } from "../presc-info";

  export let 薬品補足レコード: 薬品補足レコード[] | undefined;
  export let onDone: (recs: 薬品補足レコード[] | undefined) => void;
  export let onClose: () => void;
  let input = "";
  let kubun: 薬品補足区分 | "undefined" = "undefined";

  function doEnterFreeInput() {
    input = input.trim();
    if (input !== "") {
      const r: 薬品補足レコード = {
        薬品補足情報: input,
      };
      onDone(addRecord(r));
    }
  }

  function doDelete(rec: 薬品補足レコード) {
    onDone(delRecord(rec));
  }

  function onKubunChange() {
    if (kubun === "undefined") {
      input = "";
    } else {
      const r: 薬品補足レコード = {
        薬品補足情報: kubun,
      };
      onDone(addRecord(r));
    }
  }

  function addRecord(r: 薬品補足レコード): 薬品補足レコード[] {
    let cur = getCurrent();
    return [...cur, r];
  }

  function delRecord(rec: 薬品補足レコード): 薬品補足レコード[] {
    let cur = getCurrent();
    return cur.filter((r) => r !== rec);
  }

  function getCurrent(): 薬品補足レコード[] {
    if( 薬品補足レコード === undefined ) {
      return [];
    } else {
      return 薬品補足レコード;
    }
  }
</script>

<div>
  {#each 薬品補足レコード ?? [] as rec}
    <ul>
      <li>
        {rec.薬品補足情報}
        <a href="javascript:void(0)" on:click={() => doDelete(rec)}>削除</a>
      </li>
    </ul>
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
      <a
        href="javascript:void(0)"
        style="position:relative;top:5px;margin-left:3px;"
        on:click={onClose}
      >
        <XCircle color="#999" width="22" />
      </a>
    </div>
    {#if kubun === "undefined"}
      <form style="margin-top:6px;" on:submit|preventDefault={doEnterFreeInput}>
        <input type="text" bind:value={input} />
      </form>
    {/if}
  </div>
</div>
