<script lang="ts">
  import Dialog from "../Dialog.svelte";
  import { printApi } from "../printApi";

  export let destroy: () => void;
  export let settingName: string;
  export let auxSetting: any;
  let dx: string = "";
  let dy: string = "";
  let scale: string = "";

  if (auxSetting) {
    auxSetting = {};
  }
  dx = auxSetting.dx ?? "0";
  dy = auxSetting.dy ?? "0";
  scale = auxSetting.scale ?? "1";

  async function doEnter() {
    const newAux = { dx, dy, scale };
    await printApi.setPrintAuxSetting(settingName, newAux);
    destroy();
  }

  function doCancel() {
    destroy();
  }
</script>

<Dialog title="移動・縮小の編集" {destroy}>
  <div>name: {settingName}</div>
  <div style="display:grid; grid-template-columns: auto auto;gap: 4px;margin:10px 0;">
    <div style="text-align:right"><span>dx</span></div>
    <div style="display:inline-block">
      <input type="text" bind:value={dx} style="width: 3em" /> mm
    </div>
    <div style="text-align:right"><span>dy</span></div>
    <div style="display:inline-block">
      <input type="text" bind:value={dy} style="width: 3em" /> mm
    </div>
    <div style="text-align:right"><span>scale</span></div>
    <div style="display:inline-block">
      <input type="text" bind:value={scale} style="width: 3em" />
    </div>
  </div>
  <div style="text-align: right;">
    <button on:click={doEnter}>入力</button>
    <button on:click={doCancel}>キャンセル</button>
  </div>
</Dialog>
