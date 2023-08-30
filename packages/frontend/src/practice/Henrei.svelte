<script lang="ts">
  import ServiceHeader from "@/ServiceHeader.svelte";

  export let isVisible: boolean;
  let henreiData: string = "";
  let seikyuuFile: string = "";
  let seikyuuData: string = "";
  let seikyuuTail: string = "";
  let rezepts: [string, string[]][] = [];

  function doImport() {
    if( henreiData === "" ){
      return;
    }
    let [seikyuu, tail] = parseHenreiData(henreiData);
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
    seikyuuFile = mkFileName(seikyuu[0]);
    return [seikyuu, tail];
  }

  function doAdd() {
    let seikyuuRows: string[] = seikyuuData.split("\n");
    let tailRows: string[] = seikyuuTail.split("\n");
    let line = seikyuuRows[0];
    if( !line.startsWith("RE") ){
      alert("Invalid Seikyuu first row ('RE' expected).");
      return;
    }
    let values = line.split(",");
    let ym = values[3];
    let name = values[4];
    name = name.replaceAll(" ", "");
    name = name.replaceAll("　", "");
    let patientId = values[13];
    let file = `henrei-${ym}-${name}-${patientId}.csv`;
    rezepts = [[file, [...seikyuuRows, ...tailRows]], ...rezepts];
    console.log(rezepts);
  }

  function mkFileName(line: string): string {
    if( !line.startsWith("RE") ){
      throw new Error("Invalid Seikyuu first row ('RE' expected).");
    }
    let values = line.split(",");
    let ym = values[3];
    let name = values[4];
    name = name.replaceAll(" ", "");
    name = name.replaceAll("　", "");
    let patientId = values[13];
    return `henrei-${ym}-${name}-${patientId}.csv`;
  }
</script>

<div style:display={isVisible ? "" : "none"}>
  <ServiceHeader title="返戻" />
  <textarea bind:value={henreiData} class="import-data" />
  <button on:click={doImport}>取込</button>
  <div class="seikyuu-area">
    <div>{seikyuuFile}</div>
    <textarea bind:value={seikyuuData} class="seikyuu-data" />
    <pre class="seikyuu-tail">{seikyuuTail}</pre>
    <button on:click={doAdd}>追加</button>
  </div>
  <div class="rezept-area">
    <div>
      {#each rezepts.map(item => item[0]) as file}
        <div>{file}</div>
      {/each}
    </div>
  </div>
</div>

<style>
  .import-data {
    width: 80ch;
    height: 20ch;
    display: block;
    margin-bottom: 6px;
  }

  .seikyuu-area, .rezept-area {
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
