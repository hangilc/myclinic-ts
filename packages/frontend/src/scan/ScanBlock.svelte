<script lang="ts">
  import { confirm } from "@/lib/confirm-call";
  import { printApi, type ScannerDevice } from "@/lib/printApi";
  import SearchPatientDialog from "@/lib/SearchPatientDialog.svelte";
  import type { Patient } from "myclinic-model";
  import { writable, type Writable } from "svelte/store";
  import { docsAddTask, taskDelete } from "./docs-task";
  import { kindChoices } from "./kind-choices";
  import { makePatientText, makeScannerText } from "./misc";
  import { ScanManager } from "./scan-manager";
  import {
    isScannerAvailable,
    scannerProbed,
    ScannerState,
    scannerUsage,
  } from "./scan-vars";
  import ScanKindPulldown from "./ScanKindPulldown.svelte";
  import { ScannedDocData, UploadStatus } from "./scanned-doc-data";
  import ScannedDoc from "./ScannedDoc.svelte";
  import ScanProgress from "./ScanProgress.svelte";
  import { startScan } from "./start-scan";

  export let remove: () => void;

  let manager = new ScanManager();
  let patientText: string = makePatientText(manager.patient);
  let kindText: string = manager.kindKey;
  let scannerText: string = makeScannerText(manager.scanDevice);
  let scannerList: ScannerDevice[] = [];
  let scannerSelect: Writable<ScannerDevice | undefined> = writable(undefined);
  let selectKindLink: HTMLElement;
  let scanDate: Date | undefined = undefined;
  let scannedDocs: Writable<ScannedDocData[]> = writable([]);
  let unUploadedFileExists = false;
  let scannerAvailable: Writable<boolean> = writable(false);
  let canScan: boolean = false;
  let isScanning: Writable<boolean> = writable(false);
  let scanPct: Writable<number> = writable(0);

  manager.onPatientChange = (p: Patient) => {
    patientText = makePatientText(p);
  };

  manager.onScannableChange = (available: boolean) => {
    canScan = available;
  };

  manager.onScannerChange = (scanner: ScannerDevice | undefined) => {
    scannerText = makeScannerText(scanner);
  };

  manager.onKindKeyChange = (key: string) => {
    kindText = key;
  }

  probeScanner();

  $: unUploadedFileExists = hasUnUploaded($scannedDocs);

  function updateDocs(newDocs: ScannedDocData[]): void {
    scannedDocs.set(newDocs);
  }

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

  function doSelectKind(): void {
    const d: ScanKindPulldown = new ScanKindPulldown({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        anchor: selectKindLink,
        onEnter: (k: string) => manager.setKindKey(k),
      },
    });
  }

  function getScanDate(): Date {
    if (scanDate == undefined) {
      scanDate = new Date();
    }
    return scanDate;
  }

  async function scan(): Promise<string | undefined> {
    const scanner = manager.scanDevice;
    if (scanner == undefined) {
      alert("スキャナーが設定されていません。");
      return;
    }
    return await startScan(scanner.deviceId, isScanning, scanPct);
  }

  async function doStartScan() {
    const patient = manager.patient;
    if (patient == undefined) {
      alert("患者が設定されていません。");
      return;
    }
    const scanner = manager.scanDevice;
    if (scanner == undefined) {
      alert("スキャナーが設定されていません。");
      return;
    }
    const kindValue = manager.scanKind;
    const imageFile = await scan();
    if (imageFile != undefined) {
      const index = $scannedDocs.length + 1;
      const data = new ScannedDocData(
        imageFile,
        patient.patientId,
        kindValue,
        getScanDate(),
        index
      );
      updateDocs([...$scannedDocs, data]);
    }
  }

  async function doRescan(data: ScannedDocData) {
    const img = await scan();
    if (img != undefined) {
      const prev = data.scannedImageFile;
      data.scannedImageFile = img;
      printApi.deleteScannedFile(prev);
    }
  }

  async function doDelete(data: ScannedDocData) {
    docsAddTask(() => {
      return taskDelete(() => $scannedDocs, data, updateDocs);
    });
  }

  async function doUpload() {
    const promises = $scannedDocs.map((doc) => doc.upload());
    await Promise.all(promises);
    updateDocs([...$scannedDocs]);
  }

  async function deleteScannedImages() {
    const promises = $scannedDocs.map((doc) =>
      printApi.deleteScannedFile(doc.scannedImageFile)
    );
    Promise.all(promises);
  }

  function doClose(): void {
    function close(): void {
      deleteScannedImages();
      remove();
    }
    if (hasUnUploaded($scannedDocs)) {
      confirm(
        "アップロードされていないファイルがありますが、閉じますか？",
        close
      );
    } else {
      close();
    }
  }

  function doSelectScanner(): void {
    const d: 
  }
</script>

<div class="top">
  <div class="title main">書類のスキャン</div>
  <div class="title">患者選択</div>
  <div class="work">
    {patientText}
    <button on:click={doSearchPatient}>検索</button>
  </div>
  <div class="title">文書の種類</div>
  <div class="work">
    {kindText}
    <a
      href="javascript:void(0)"
      on:click={doSelectKind}
      bind:this={selectKindLink}>選択</a
    >
  </div>
  <div class="title">スキャナー</div>
  <div class="work">
    {scannerText}
    <a href="javascript:void(0)" on:click={doSelectScanner}>選択</a>
  </div>
  <div class="commands">
    <button on:click={doStartScan} disabled={!canScan}>スキャン開始</button>
    {#if $isScanning}
      <ScanProgress pct={scanPct} />
    {/if}
  </div>
  <div class="title">スキャン文書</div>
  <div class="work">
    {#each $scannedDocs as doc (doc.index)}
      <ScannedDoc data={doc} onRescan={doRescan} onDelete={doDelete}/>
    {/each}
  </div>
  <div class="commands">
    <button on:click={doUpload} disabled={!unUploadedFileExists}
      >アップロード</button
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
