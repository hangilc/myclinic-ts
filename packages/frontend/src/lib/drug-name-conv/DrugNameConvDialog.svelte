<script lang="ts">
  import { cache } from "@/lib/cache";
  import Dialog2 from "@/lib/Dialog2.svelte";
  import DrugNameConvEdit from "./DrugNameConvEdit.svelte";

  export let destroy: () => void;
  let map: Record<string, string> = {};
  let matched: [number, string, string][] = [];
  let serialId = 1;
  let srcName: string = "";
  let nextEditorInvokeId = 1;
  let editorInvokeId = 0;

  init();

  async function init() {
    map = await cache.getDrugNameConv();
    matched = [];
    for (let key in matched) {
      matched.push([serialId++, key, map[key]]);
    }
  }

  function doNew() {
    srcName = "";
    editorInvokeId = nextEditorInvokeId++;
  }

  function doEditorCancel() {
    editorInvokeId = 0;
    srcName = "";
  }

  async function doEditorEnter(srcName: string, dstName: string) {
    map[srcName] = dstName;
    await cache.setDrugNameConv(map);
    map = map;
    srcName = "";
  }
</script>

<Dialog2 {destroy} title="薬品名変換管理">
  <div class="top">
    <div>
      <div>
        <button on:click={doNew}>新規</button>
      </div>
      <div>
        {#each matched as [id, src, dst] (id)}
          <div>{src} → {dst}</div>
        {/each}
      </div>
    </div>
    <div>
      {#if editorInvokeId > 0}
        <DrugNameConvEdit
          invokeId={editorInvokeId}
          {srcName}
          onCancel={doEditorCancel}
          onEnter={doEditorEnter}
        />
      {/if}
    </div>
  </div>
</Dialog2>

<style>
  .top {
    width: 700px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 10px;
    padding: 10px;
  }
</style>
