<script lang="ts">
  import type { 薬品補足区分 } from "../denshi-shohou";
  import type { 薬品補足レコード } from "../presc-info";

  export let 薬品補足レコード: 薬品補足レコード[] | undefined;
  export let onDone: (recs: 薬品補足レコード[] | undefined) => void;
  let input = "";

  let kubun: 薬品補足区分 | "undefined" = "undefined";
  function doEnter() {
    input = input.trim();
    if (input) {
      const r: 薬品補足レコード = {
        薬品補足情報: kubun === "undefined" ? input : kubun,
      };
      let cur = 薬品補足レコード ?? [];
      cur = [...cur, r];
      薬品補足レコード = cur;
      onDone(cur);
      input = "";
    }
  }

  function doDelete(rec: 薬品補足レコード) {
    if (薬品補足レコード) {
      薬品補足レコード = 薬品補足レコード.filter((r) => r !== rec);
      onDone(薬品補足レコード);
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

<div>
  {#each 薬品補足レコード ?? [] as rec}
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
      <button
        disabled={kubun === "undefined" && input === ""}
        on:click={doEnter}>追加</button
      >
    </div>
  </div>
</div>
