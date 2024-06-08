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
    if (name === "") {
      return;
    }
    try {
      await printApi.createPrintSetting(name);
      alert("印刷設定が作成されました。");
      newSettingInput = "";
      await init();
    } catch (ex: any) {
      alert(ex.toString());
    }
  }

  async function doDelete(setting: string) {
    if( !confirm(`この印刷設定を削除していいですか？ ${setting}`) ){
      return;
    }
    try {
      await printApi.deletePrintSetting(setting);
      alert("印刷設定が削除されました。");
      await init();
    } catch(ex: any){
      alert(ex.toString());
    }
  }

  async function doDetail(setting: string) {
    try {
      const result = await printApi.getPrintSettingDetail(setting);
      alert(JSON.stringify(result, undefined, 2));
    } catch(ex: any){
      alert(ex.toString());
    }
  }

  async function doChangePrinter(setting: string) {
    const pd = await printApi.printDialog(setting);
    if( !pd ){
      return;
    }
    const current = await printApi.getPrintSetting(setting);
    pd.auxSetting = current.auxSetting;
    try {
      await printApi.setPrintSetting(setting, pd);
      alert(`${setting} のプリンターが変更されました。`);
    } catch(ex: any){
      alert(ex.toString());
    }
  }

  async function doChangeAux(setting: string) {
    const current = await printApi.getPrintAuxSetting(setting);
    console.log(current);
  }
</script>

<ServiceHeader title="印刷設定" />

<div>
  <h1>新規作成</h1>
  <div>
    <input type="text" bind:value={newSettingInput} />
    <button on:click={doCreate}>作成</button>
  </div>
</div>

<div>
  <h1>設定一覧</h1>
  <div>
    {#each settings as setting}
      <div>
        <span>{setting}</span> :
        <a href="javascript:void(0)" on:click={() => doDetail(setting)}>詳細</a> |
        <a href="javascript:void(9)" on:click={() => doChangePrinter(setting)}>プリンターの変更</a> |
        <a href="javascript:void(9)" on:click={() => doChangeAux(setting)}>移動・縮小の変更</a> |
        <a href="javascript:void(0)" on:click={() => doDelete(setting)}>削除</a>
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
