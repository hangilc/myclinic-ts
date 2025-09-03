<script lang="ts">
  import api from "@/lib/api";
  import { cache } from "@/lib/cache";
  import ServiceHeader from "@/ServiceHeader.svelte";

  let configKeys: string[] = [];
  let isEditing = false;
  let editKey = "";
  let editValue = "";
  let isAdding = false;
  let newKey = "";
  let newValue = "";

  init();

  async function init() {
    configKeys = await api.listConfigKey();
  }

  async function doEdit(key: string) {
    const value = await api.getConfig(key);
    editKey = key;
    editValue = JSON.stringify(value, undefined, 2);
    isEditing = true;
  }

  async function doEnter() {
    let value: any;
    try {
      value = JSON.parse(editValue);
    } catch {
      alert("Invalid JSON");
      return;
    }
    await api.setConfig(editKey, value);
    isEditing = false;
    switch (editKey) {
      case "usage-master-map": {
        cache.clearUsageMasterMap();
        break;
      }
      case "drug-name-conv": {
        cache.reloadDrugNameConv();
        break;
      }
      case "drug-usage-conv": {
        cache.reloadDrugUsageConv();
        break;
      }
      // case "drug-name-iyakuhincode-map": {
      //   cache.clearDrugNameIyakuhincodeMap();
      //   break;
      // }
    }
  }

  function doAdd() {
    newKey = "";
    newValue = "";
    isAdding = true;
  }

  async function doAddEnter() {
    if (newKey === "") {
      alert("Empty key");
      return;
    }
    if (configKeys.includes(newKey)) {
      alert("key already exists");
      return;
    }
    let value: any;
    try {
      value = JSON.parse(newValue);
    } catch {
      alert("Invalid JSON");
      return;
    }
    await api.setConfig(newKey, value);
    isAdding = false;
    await init();
  }
</script>

<ServiceHeader title="Config" />
<div class="key-wrapper">
  {#each configKeys as key (key)}
    <div>{key} <button on:click={() => doEdit(key)}>編集</button></div>
  {/each}
</div>
<div>
  <button on:click={doAdd}>追加</button>
</div>
{#if isAdding}
  <div class="edit-wrapper">
    <div>
      <span class="edit-label">Key:</span>
      <input type="text" bind:value={newKey} />
    </div>
    <span class="edit-label">Value:</span>
    <div>
      <textarea bind:value={newValue} class="edit-value" />
    </div>
    <div>
      <button on:click={doAddEnter}>入力</button>
      <button on:click={() => (isAdding = false)}>キャンセル</button>
    </div>
  </div>
{/if}
{#if isEditing}
  <div class="edit-wrapper">
    <div>
      <span class="edit-label">Key</span>: {editKey}
    </div>
    <span class="edit-label">Value:</span>
    <div>
      <textarea bind:value={editValue} class="edit-value" />
    </div>
    <div>
      <button on:click={doEnter}>入力</button>
      <button on:click={() => (isEditing = false)}>キャンセル</button>
    </div>
  </div>
{/if}

<style>
  .key-wrapper {
    margin-bottom: 10px;
  }

  .edit-label {
    font-weight: bold;
  }

  .edit-value {
    width: 400px;
    height: 400px;
    resize: both;
  }
</style>
