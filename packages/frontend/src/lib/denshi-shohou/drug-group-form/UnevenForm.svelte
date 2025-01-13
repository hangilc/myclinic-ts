<script lang="ts">
  import { toHankaku } from "myclinic-rezept/zenkaku";
  import type { 不均等レコード } from "../presc-info";

  export let 不均等レコード: 不均等レコード | undefined;
  export let onDone: (value: 不均等レコード | undefined) => void;
  let 不均等１回目服用量 = "";
  let 不均等２回目服用量 = "";
  let 不均等３回目服用量 = "";
  let 不均等４回目服用量 = "";
  let 不均等５回目服用量 = "";

  function doClear() {
    onDone(undefined);
  }

  function doEnter() {
    if (不均等１回目服用量 === "") {
      alert("不均等１回目服用量が入力されていません。");
      return;
    }
    if (不均等２回目服用量 === "") {
      alert("不均等２回目服用量が入力されていません。");
      return;
    }
    try {
      const rec: 不均等レコード = {
        不均等１回目服用量: resolve(不均等１回目服用量, "不均等１回目服用量"),
        不均等２回目服用量: resolve(不均等２回目服用量, "不均等２回目服用量"),
        不均等３回目服用量: resolveOpt(
          不均等３回目服用量,
          "不均等３回目服用量"
        ),
        不均等４回目服用量: resolveOpt(
          不均等４回目服用量,
          "不均等４回目服用量"
        ),
        不均等５回目服用量: resolveOpt(
          不均等５回目服用量,
          "不均等５回目服用量"
        ),
      };
      onDone(rec);
    } catch (ex) {
      alert(ex);
    }
  }

  function toNumberString(value: string, label: string): string {
    value = toHankaku(value);
    const n = parseFloat(value);
    if (isNaN(n)) {
      throw `${label}の入力が数値でありません。`;
    }
    if (!(n >= 0)) {
      throw `${label}の値が正またはゼロでありません。`;
    }
    return n.toString();
  }

  function resolve(value: string, label: string): string {
    value = value.trim();
    if (value === "") {
      throw `${label}の値が入力されていません。`;
    }
    return toNumberString(value, label);
  }

  function resolveOpt(value: string, label: string): string | undefined {
    value = value.trim();
    if (value === "") {
      return undefined;
    }
    return toNumberString(value, label);
  }
</script>

<div>
  <div>
    １回目服用量 <input
      type="text"
      bind:value={不均等１回目服用量}
      style="width:4em"
    />
  </div>
  <div>
    ２回目服用量 <input
      type="text"
      bind:value={不均等２回目服用量}
      style="width:4em"
    />
  </div>
  <div>
    ３回目服用量 <input
      type="text"
      bind:value={不均等３回目服用量}
      style="width:4em"
    />
  </div>
  <div>
    ４回目服用量 <input
      type="text"
      bind:value={不均等４回目服用量}
      style="width:4em"
    />
  </div>
  <div>
    ５回目服用量 <input
      type="text"
      bind:value={不均等５回目服用量}
      style="width:4em"
    />
  </div>
</div>
<div>
  <button on:click={doClear}>不均等クリア</button>
  <button on:click={doEnter}>不均等設定</button>
</div>
