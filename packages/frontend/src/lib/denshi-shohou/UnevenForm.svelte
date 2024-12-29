<script lang="ts">
  import { toHankaku } from "../zenkaku";
  import { unevenDisp } from "./disp/disp-util";
  import type { 不均等レコード } from "./presc-info";

  export let orig: 不均等レコード | undefined;
  export let onEnter: (orig: 不均等レコード | undefined) => void;
  let input = orig ? unevenDisp(orig) : "";
  let error = "";

  function parseUneven(input: string): 不均等レコード | string {
    input = toHankaku(input);
    let parts = input.split("-").map((p) => p.trim());
    if (parts.length < 2) {
      return "不均等項目の数が２未満です。";
    }
    let rec: 不均等レコード = {
      不均等１回目服用量: parts[0],
      不均等２回目服用量: parts[1],
    };
    if (parts[2]) {
      rec.不均等３回目服用量 = parts[2];
    }
    if (parts[3]) {
      rec.不均等４回目服用量 = parts[3];
    }
    if (parts[4]) {
      rec.不均等５回目服用量 = parts[4];
    }
    return rec;
  }

  function doEnter() {
    input = input.trim();
    if (input === "") {
      onEnter(undefined);
    } else {
      const r = parseUneven(input);
      if (typeof r == "string") {
        error = r;
      } else {
        console.log("r", r);
        onEnter(r);
      }
    }
  }

  function doClear() {
    input = "";
    doEnter();
  }
</script>

<div style="border:1px solid gray;border-radius:4px;padding:10px;margin:4px 0;">
  {#if error}
    <div style="margin:10px 0;color:red;padding:10px;">{error}</div>
  {/if}
  不均等設定：<input type="text" bind:value={input} style="width:4em" />
  <span style="color:gray;">(例：2-1-1)</span>
  <div style="margin-top:4px;">
    <button on:click={doEnter}>設定</button>
    <button on:click={doClear}>クリア</button>
  </div>
</div>
