<script lang="ts">
  import { confirm } from "@/lib/confirm-call";
  import Popup from "@/lib/Popup.svelte";
  import { printApi, type ScannerDevice } from "@/lib/printApi";
  import SearchPatientDialog from "@/lib/SearchPatientDialog.svelte";
  import type { Patient } from "myclinic-model";
  import { writable, type Writable } from "svelte/store";
  import { makePatientText, makeScannerText } from "./misc";
  import { ScanManager } from "./scan-manager";
  import { scannerProbed } from "./scan-vars";
  import ScanKindPulldown from "./ScanKindPulldown.svelte";
  import { UploadStatus, type ScannedDocData } from "./scanned-doc-data";
  import ScannedDoc from "./ScannedDoc.svelte";
  import ScanProgress from "./ScanProgress.svelte";
  import SelectScannerPulldown from "./SelectScannerPulldown.svelte";

  export let remove: () => void;

  let manager = new ScanManager();
  let patientText: string = makePatientText(manager.patient);
  let kindText: string = manager.kindKey;
  let scannerText: string = makeScannerText(manager.scanDevice);
  let scannerList: ScannerDevice[] = [];
  let scannedDocs: ScannedDocData[] = [];
  let canScan: Writable<boolean> = writable(false);
  let isScanning: boolean = false;
  let scanPct: number = 0;
  let canUpload: boolean = false;

  manager.onPatientChange = (p: Patient) => {
    patientText = makePatientText(p);
  };

  manager.onScannableChange = (available: boolean) => canScan.set(available);
  manager.onScannerChange = (scanner: ScannerDevice | undefined) => {
    scannerText = makeScannerText(scanner);
  };

  manager.onKindKeyChange = (key: string) => (kindText = key);

  manager.onDocsChange = (docs) => {
    scannedDocs = docs;
    canUpload = hasUnUploaded(docs);
  };
  manager.onScanStart = () => (isScanning = true);
  manager.onScanEnd = () => (isScanning = false);
  manager.onScanPctChange = (pct) => (scanPct = pct);

  probeScanner();

  async function probeScanner() {
    const result = await printApi.listScannerDevices();
    for (const r of result) {
      scannerProbed(r.deviceId);
    }
    scannerList = result;
    if (result.length >= 1) {
      manager.setDevice(result[0]);
    }
  }

  function hasUnUploaded(docs: ScannedDocData[]): boolean {
    for (let doc of docs) {
      if (doc.uploadStatus !== UploadStatus.Success) {
        return true;
      }
    }
    return false;
  }

  function doSearchPatient(): void {
    const d: SearchPatientDialog = new SearchPatientDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        title: "患者検索（スキャン）",
        onEnter: (p: Patient) => {
          manager.setPatient(p);
        },
      },
    });
  }

  function doStartScan(): void {
    manager.scan();
  }

  async function doRescan(data: ScannedDocData) {
    manager.reScan(data);
  }

  async function doDelete(data: ScannedDocData) {
    confirm("このスキャン文書を削除しますか？", () => manager.deleteDoc(data));
  }

  async function doUpload() {
    manager.upload();
  }

  function deleteScannedImages() {
    manager.deleteScannedImages();
  }

  function doClose(): void {
    function close(): void {
      deleteScannedImages();
      remove();
    }
    if (canUpload) {
      confirm(
        "アップロードされていないファイルがありますが、閉じますか？",
        close
      );
    } else {
      close();
    }
  }
</script>

<div class="top" data-cy="scan-block">
  <div class="title main">書類のスキャン</div>
  <div class="title">患者選択</div>
  <div class="work" data-cy="patient-workarea">
    <span data-cy="patient-text">{patientText}</span>
    <button on:click={doSearchPatient}>検索</button>
  </div>
  <div class="title">文書の種類</div>
  <div class="work">
    {kindText}
    <Popup let:destroy let:trigger>
      <a href="javascript:void(0)" on:click={trigger}>選択</a>
      <ScanKindPulldown slot="menu" {destroy} onEnter={k => manager.setKindKey(k)}/>
    </Popup>
  </div>
  <div class="title">スキャナー</div>
  <div class="work">
    <span data-cy="scanner-text">{scannerText}</span>
    <Popup let:destroy let:trigger>
      <a href="javascript:void(0)" on:click={trigger}>選択</a>
      <SelectScannerPulldown slot="menu" {destroy} list={scannerList}
        current={manager.scanDevice} onSelect={d => manager.setDevice(d)}/>
    </Popup>
  </div>
  <div class="commands">
    <button on:click={doStartScan} disabled={!$canScan}>スキャン開始</button>
    {#if isScanning}
      <ScanProgress pct={scanPct} />
    {/if}
  </div>
  <div class="title">スキャン文書</div>
  <div class="work">
    {#each scannedDocs as doc (doc.id)}
      <ScannedDoc
        data={doc}
        {canScan}
        onRescan={doRescan}
        onDelete={doDelete}
      />
    {/each}
  </div>
  <div class="commands">
    <button on:click={doUpload} disabled={!canUpload}>アップロード</button
    ><button on:click={doClose}>閉じる</button>
  </div>
</div>

<style>
  .top {
    margin: 10px;
    padding: 10px;
    border: 1px solid gray;
  }

  .title {
    font-weight: bold;
    margin: 10px 0;
  }

  .main {
    font-size: 1.2rem;
  }

  .work {
    margin: 0 10px;
  }

  .commands {
    margin: 10px 0;
  }

  * + button {
    margin-left: 4px;
  }
</style>
