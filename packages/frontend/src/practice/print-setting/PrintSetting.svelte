<script lang="ts">
  import ServiceHeader from "@/ServiceHeader.svelte";
  import { printApi } from "@/lib/printApi";

  let settings: string[] = [];
  let newSettingInput: string = "";

  init();

  async function init() {
    settings = await printApi.listPrintSetting();
  }

  async function doCreate() {
    const name = newSettingInput.trim();
    if( name === "" ){
      return;
    }
    await printApi.createPrintSetting(name);
    alert("印刷設定が作成されました。");
    await init();
  }
</script>

<ServiceHeader title="印刷設定" />

<div>
  <h1>新規作成</h1>
  <div>
    <input type="text" bind:value={newSettingInput} /> <button on:click={doCreate}>作成</button>
  </div>
</div>

<div>
  <h1>設定一覧</h1>
  <div>
    {#each settings as setting}
      <div>
        <span>{setting}</span>
      </div>
    {/each}
  </div>
</div>

<div>
  <h1>スキャナー</h1>
</div>

<style>
  h1 {
    font-size: 1.5em;
  }
</style>