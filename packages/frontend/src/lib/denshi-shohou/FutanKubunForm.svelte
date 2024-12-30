<script lang="ts">
  import type { 公費レコード, 負担区分レコード } from "./presc-info";

  export let futanKubun: 負担区分レコード | undefined;
  export let kouhiList: [
    公費レコード | undefined,
    公費レコード | undefined,
    公費レコード | undefined,
    公費レコード | undefined,
  ];
  export let onEnter: (kubun: 負担区分レコード | undefined) => void;
  let kouhi1 = kouhiList[0] ? `第一公費（${kouhiList[0].公費負担者番号}）` : "";
  let kouhi2 = kouhiList[1] ? `第二公費（${kouhiList[1].公費負担者番号}）` : "";
  let kouhi3 = kouhiList[2] ? `第三公費（${kouhiList[2].公費負担者番号}）` : "";
  let kouhi4 = kouhiList[3] ? `特殊公費（${kouhiList[3].公費負担者番号}）` : "";
  let kouhi1Check = futanKubun?.第一公費負担区分 ?? false;
  let kouhi2Check = futanKubun?.第二公費負担区分 ?? false;
  let kouhi3Check = futanKubun?.第三公費負担区分 ?? false;
  let kouhi4Check = futanKubun?.特殊公費負担区分 ?? false;

  function doEnter() {
    let kubun: 負担区分レコード = { };
    if( kouhi1Check ){
      kubun.第一公費負担区分 = true;
    }
    if( kouhi2Check ){
      kubun.第二公費負担区分 = true;
    }
    if( kouhi3Check ){
      kubun.第三公費負担区分 = true;
    }
    if( kouhi4Check ){
      kubun.特殊公費負担区分 = true;
    }
    if( Object.keys(kubun).length === 0 ){
      onEnter(undefined);
    } else {
      onEnter(kubun);
    }
  }
</script>

<div style="border:1px solid gray;border-radius:4px;padding:10px;margin:4px 0;">
  {#if kouhi1 !== ""}
    <div><input type="checkbox" bind:checked={kouhi1Check} /> {kouhi1}</div>
  {/if}
  {#if kouhi2 !== ""}
    <div><input type="checkbox" bind:checked={kouhi2Check} /> {kouhi2}</div>
  {/if}
  {#if kouhi3 !== ""}
    <div><input type="checkbox" bind:checked={kouhi3Check} /> {kouhi3}</div>
  {/if}
  {#if kouhi4 !== ""}
    <div><input type="checkbox" bind:checked={kouhi4Check} /> {kouhi4}</div>
  {/if}
  <div>
    <button on:click={doEnter}>入力</button>
  </div>
</div>
