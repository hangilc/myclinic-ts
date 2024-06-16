<script lang="ts">
  import Dialog from "./Dialog.svelte";
  import api from "./api";
  import type { ReferConfig } from "./refer";

  export let destroy: () => void;
  export let configs: ReferConfig[];
  export let onEntered: (list: ReferConfig[]) => void;
  let index = 0;
  let configList: (ReferConfig & { id: number })[] = configs.map((c) =>
    Object.assign({}, c, { id: index++ })
  );
  let newConfig: ReferConfig = { hospital: "", section: "", doctor: "" };

  function doAdd() {
    configList = [...configList, Object.assign(newConfig, { id: index++ })];
    newConfig = { hospital: "", section: "", doctor: "" };
  }

  async function doEnter() {
    const list = configList.map((ci) => {
      const { id, ...c } = ci;
      return c;
    });
    await api.setConfig("refer", list);
    destroy();
    onEntered(list);
  }

  function swap(i: number, j: number) {
    const c = configList[i];
    configList[i] = configList[j];
    configList[j] = c;
  }

  function doItemUp(id: number) {
    const i = configList.findIndex((c) => c.id === id);
    if (i > 0) {
      swap(i - 1, i);
      configList = configList;
    }
  }

  function doItemDown(id: number) {
    const i = configList.findIndex((c) => c.id === id);
    if (i < configList.length - 1) {
      swap(i, i + 1);
      configList = configList;
    }
  }

  function doItemDelete(id: number) {
    const c = configList.find((c) => c.id === id);
    if (c) {
      const prompt = `${[c.hospital, c.section, c.doctor].join(":")}を削除していいですか？`;
      if (!confirm(prompt)) {
        return;
      }
      configList = configList.filter(c => c.id !== id);
    }
  }
</script>

<Dialog title="紹介先設定" {destroy}>
  <div style="margin-bottom:10px;max-height:400px;overflow-y:auto;">
    {#each configList as cfg (cfg.id)}
      <div
        style="border:1px solid gray;border-radius:4px;padding:10px;margin-right: 10px;margin-bottom:10px;"
      >
        <div style="display:grid;grid-template-columns:auto 10em;gap:4px;">
          <span>医療機関名：</span>
          <input type="text" bind:value={cfg.hospital} />
          <span>診療科：</span>
          <input type="text" bind:value={cfg.section} />
          <span>医師名：</span>
          <input type="text" bind:value={cfg.doctor} />
        </div>
        <div style="margin-top:6px;">
          <a href="javascript:void(0)" on:click={() => doItemUp(cfg.id)}>上へ</a
          >
          <a href="javascript:void(0)" on:click={() => doItemDown(cfg.id)}
            >下へ</a
          >
          <a href="javascript:void(0)" on:click={() => doItemDelete(cfg.id)}
            >削除</a
          >
        </div>
      </div>
    {/each}
  </div>
  <div
    style="border:1px solid green;border-radius:4px;padding:10px;margin-right:10px;"
  >
    <div
      style="display:grid;grid-template-columns:auto 10em;gap:4px;margin-bottom:6px;"
    >
      <span>医療機関名：</span>
      <input type="text" bind:value={newConfig.hospital} />
      <span>診療科：</span>
      <input type="text" bind:value={newConfig.section} />
      <span>医師名：</span>
      <input type="text" bind:value={newConfig.doctor} />
    </div>
    <div style="text-align:right;">
      <button on:click={doAdd}>追加</button>
    </div>
  </div>
  <div style="text-align: right;margin-top:10px;">
    <button on:click={doEnter}>入力</button>
    <button on:click={destroy}>キャンセル</button>
  </div>
</Dialog>
