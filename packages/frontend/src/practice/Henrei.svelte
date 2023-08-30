<script lang="ts">
  import ServiceHeader from "@/ServiceHeader.svelte";

  export let isVisible: boolean;
  let henreiData: string = "";
  let seikyuuData: string = "";
  let seikyuuTail: string = "";

  function doImport() {
    if( henreiData === "" ){
      return;
    }
    let [seikyuu, tail] = parseHenreiData(henreiData);
    console.log(seikyuu);
    console.log();
    console.log(tail);
    henreiData = "";
    seikyuuData = seikyuu.join("\n");
    seikyuuTail = tail.join("\n");
  }

  function parseHenreiData(data: string): [string[], string[]] {
    const rows = henreiData.split(/\r?\n/).filter(s => s !== "");
    let seikyuu: string[] = [];
    let tail: string[] = []
    let isSeikyuu = true;
    for(let row of rows) {
      if( row.startsWith("HR") ) {
        isSeikyuu = false;
      }
      (isSeikyuu ? seikyuu : tail).push(row);
    }
    return [seikyuu, tail];
  }

  function doAdd() {
    
  }
</script>

<div style:display={isVisible ? "" : "none"}>
  <ServiceHeader title="返戻" />
  <textarea bind:value={henreiData} class="import-data"/>
  <button on:click={doImport}>取込</button>
  <div class="seikyuu-area">
    <textarea bind:value={seikyuuData} class="seikyuu-data" />
    <pre class="seikyuu-tail">{seikyuuTail}</pre>
    <button on:click={doAdd}>追加</button>
  </div>
</div>

<style>
  .import-data {
    width: 80ch;
    height: 20ch;
    display: block;
    margin-bottom: 6px;
  }

  .seikyuu-area {
    margin: 10px 0;
  }

  .seikyuu-data {
    width: 80ch;
    height: 20ch;
    display: block;
    margin-bottom: 6px;
  }

  .seikyuu-tail {
    width: 80ch;
    overflow-x: auto;
  }
</style>
