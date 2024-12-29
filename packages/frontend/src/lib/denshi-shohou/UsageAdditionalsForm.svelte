<script lang="ts">
  import type { 用法補足区分 } from "./denshi-shohou";
  import type { 用法補足レコード } from "./presc-info";

  export let records: 用法補足レコード[] | undefined;
  export let onEnter: (records: 用法補足レコード[] | undefined) => void;
  let kubun: 用法補足区分 | "undefined" = "用法の続き";
  let info = "";

  function doEnter() {
    info = info.trim();
    if( info !== "" ){
      const rec = {
        用法補足区分: kubun === "undefined" ? undefined : kubun,
        用法補足情報: info,
      }
      records = [...(records ?? []), rec];
      onEnter(records);
      info = "";
    }
  }

  function doDelete(rec: 用法補足レコード) {
    records = records?.filter(r => r !== rec);
    onEnter(records);
  }
</script>

<div style="border:1px solid gray;border-radius:4px;padding:10px;margin:4px 0;">
  {#each records ?? [] as record}
    {record.用法補足情報} <a href="javascript:void(0)" on:click={() => doDelete(record)}>削除</a>
  {/each}
  <div style="display:grid;grid-template-columns:auto 1fr;gap:4px;">
    <div>区分：</div>
    <div>
      <span style="white-space:nowrap"
        ><input type="radio" bind:group={kubun} value="漸減" /> 漸減</span
      >
      <span style="white-space:nowrap"
        ><input type="radio" bind:group={kubun} value="一包化" /> 一包化
      </span>
      <span style="white-space:nowrap"
        ><input type="radio" bind:group={kubun} value="隔日" /> 隔日
      </span>
      <span style="white-space:nowrap"
        ><input type="radio" bind:group={kubun} value="粉砕" /> 粉砕
      </span>
      <span style="white-space:nowrap"
        ><input type="radio" bind:group={kubun} value="用法の続き" /> 用法の続き
      </span>
      <span style="white-space:nowrap"
        ><input type="radio" bind:group={kubun} value="部位" /> 部位
      </span>
      <span style="white-space:nowrap"
        ><input type="radio" bind:group={kubun} value="１回使用量" /> １回使用量
      </span>
      <span style="white-space:nowrap"
        ><input type="radio" bind:group={kubun} value="undefined" /> 未設定
      </span>
    </div>
    <div>情報：</div>
    <div>
      <input type="text" bind:value={info} /> <button on:click={doEnter}>入力</button>
    </div>
  </div>
</div>
