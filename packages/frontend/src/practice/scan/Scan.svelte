<script lang="ts">
  import ServiceHeader from "@/ServiceHeader.svelte";
  import { printApi } from "@/lib/printApi";
  import type { ScannerDevice } from "myclinic-model";

  let scanner: string | undefined = undefined;
  let scanners: ScannerDevice[] = [];
  let progress: string = "";
  let scanning = false;
  let scannedFiles: string[] = [];

  init();

  async function init() {
    scanners = await printApi.listScannerDevices();
    if (scanners.length > 0) {
      scanner = scanners[0].name;
    }
  }

  function findDevice(name: string | undefined): ScannerDevice | undefined {
    if (!name) {
      return undefined;
    }
    for (const s of scanners) {
      if (s.name === name) {
        return s;
      }
    }
    return undefined;
  }

  async function doScan() {
    const device = findDevice(scanner);
    if (device) {
      scanning = true;
      const file = await printApi.scan(device.deviceId, (loaded, total) => {
        const pct = Math.round(loaded/total*100);
        progress = `${pct}%`;
      });
      scanning = false;
      scannedFiles = [...scannedFiles, file];
    }
  }

  function doView(file: string) {
    const url = printApi.scannedFileUrl(file);
    window.open(url, "_blank");
  }

  async function doDelete(file: string) {
    if( !confirm(`このスキャン画像を削除しますか？ ${file}`)){
      return;
    }
    try {
      await printApi.deleteScannedFile(file);
      scannedFiles = scannedFiles.filter(f => f !== file);
    } catch(ex: any){
      alert(ex.toString());
    }
  }
</script>

<ServiceHeader title="スキャン" />
<select bind:value={scanner}>
  {#each scanners as device}
    <option value={device.name}>{device.name}</option>
  {/each}
</select>
<button on:click={init}>更新</button>
<div style="margin:10x 0;">
  <button on:click={doScan}>スキャン</button>
</div>
{#if scanning}
  <div>
    Progress: {progress}
  </div>
{/if}
{#if scannedFiles.length > 0}
  <div style="margin:10px 0;">
    {#each scannedFiles as file}
    <div>
      {file}
      <a href="javascript:void(0)" on:click={() => doView(file)}>表示</a>
      <a href="javascript:void(0)" on:click={() => doDelete(file)}>削除
    </div>
    {/each}
  </div>
{/if}
