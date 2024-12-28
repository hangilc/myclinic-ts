<script lang="ts">
  import type { 備考レコード } from "./presc-info";

  export let records: 備考レコード[];
  export let onEnter: (record: 備考レコード) => void;
  let textInput = "";

  function add(text: string) {
    const rec = {
      備考: text,
    };
    onEnter(rec);
  }

  function doAdd() {
    textInput = textInput.trim();
    if (textInput !== "") {
      add(textInput);
      textInput = "";
    }
  }

  function doIppouka() {
    add("一包化");
  }
</script>

<div style="border:1px solid gray;border-radius:4px;padding:10px;">
  {#each records as record}
    <div>{record.備考}</div>
  {/each}
  新規備考：<input type="text" bind:value={textInput} />
  <button on:click={doAdd} disabled={textInput === ""}>追加</button>
  <a href="javascript:void(0)" on:click={doIppouka}>一包化</a>
</div>
