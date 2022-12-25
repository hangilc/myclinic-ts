<script lang="ts">
  import { confirm } from "@/lib/confirm-call";
  import { printApi, type ScannerDevice } from "@/lib/printApi";
  import SearchPatientDialog from "@/lib/SearchPatientDialog.svelte";
  import type { Patient } from "myclinic-model";
  import { writable, type Writable } from "svelte/store";
  import { kindChoices } from "./kind-choices";
  import {
    getScanner,
    isScannerAvailable,
    releaseScanner,
    ScannerState,
    scannerUsage,
    setScannerAvailable,
  } from "./scan-vars";
  import ScanKindPulldown from "./ScanKindPulldown.svelte";
  import { ScannedDocData, UploadStatus } from "./scanned-doc-data";
  import ScannedDoc from "./ScannedDoc.svelte";

  export let remove: () => void;
  let patient: Writable<Patient | undefined> = writable(undefined);
  let kindKey: Writable<string> = writable("その他");
  let scanner: Writable<ScannerDevice | undefined> = writable(undefined);
  let selectKindLink: HTMLElement;
  let kindValue = "";
  let scanDate: Date | undefined = undefined;
  let scannedDocs: ScannedDocData[] = [];
  let unUploadedFileExists = false;
  let scannerAvailable: Writable<boolean> = writable(false);
  let canScan = false;

  probeScanner();

  $: unUploadedFileExists = hasUnUploaded(scannedDocs);
  $: canScan = $scannerAvailable && $patient != undefined;

  scanner.subscribe((s) => {
    if (s == undefined) {
      scannerAvailable.set(false);
    } else {
      scannerAvailable.set(isScannerAvailable(s.deviceId));
    }
  });

  scannerUsage.subscribe((rec) => {
    const deviceId = $scanner?.deviceId;
    scannerAvailable.set(deviceId != undefined && rec[deviceId] === ScannerState.Available);
  });

  async function probeScanner() {
    const result = await printApi.listScannerDevices();
    for (const r of result) {
      setScannerAvailable(r.deviceId);
    }
    if (result.length >= 1) {
      scanner.set(result[0]);
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

  kindKey.subscribe((k) => {
    if (k == undefined) {
      kindValue = "";
    } else {
      kindValue = k;
    }
  });

  function doSearchPatient(): void {
    const d: SearchPatientDialog = new SearchPatientDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        title: "患者検索（スキャン）",
        onEnter: (p: Patient) => {
          patient.set(p);
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
        onEnter: (k: string) => kindKey.set(k),
      },
    });
  }

  function getScanDate(): Date {
    if (scanDate == undefined) {
      scanDate = new Date();
    }
    return scanDate;
  }

  async function doStartScan() {
    if ($patient == undefined) {
      alert("患者が設定されていません。");
      return;
    }
    if ($scanner == undefined) {
      alert("スキャナーが設定されていません。");
      return;
    }
    const kindValue = kindChoices[$kindKey] || "image";
    let scannerDevice = $scanner.deviceId;
    if (!getScanner(scannerDevice)) {
      alert("スキャナーを使用できません。");
      return;
    }
    const imageFile = await printApi.scan(scannerDevice, (loaded, total) => {
      console.log("progress", loaded, total);
    });
    const index = scannedDocs.length + 1;
    const data = new ScannedDocData(
      imageFile,
      $patient.patientId,
      kindValue,
      getScanDate(),
      index
    );
    scannedDocs = [...scannedDocs, data];
    releaseScanner(scannerDevice);
  }

  async function doUpload() {
    const promises = scannedDocs.map((doc) => doc.upload());
    await Promise.all(promises);
    scannedDocs = [...scannedDocs];
  }

  function doClose(): void {
    if (hasUnUploaded(scannedDocs)) {
      confirm(
        "アップロードされていないファイルがありますが、閉じますか？",
        remove
      );
    } else {
      remove();
    }
  }
</script>

<div class="top">
  <div class="title main">書類のスキャン</div>
  <div class="title">患者選択</div>
  <div class="work">
    {#if $patient == undefined}
      {"（未選択）"}
    {:else}
      ({$patient.patientId}) {$patient.fullName()}
    {/if}
    <button on:click={doSearchPatient}>検索</button>
  </div>
  <div class="title">文書の種類</div>
  <div class="work">
    {$kindKey}
    <a
      href="javascript:void(0)"
      on:click={doSelectKind}
      bind:this={selectKindLink}>選択</a
    >
  </div>
  <div class="title">スキャナー</div>
  <div class="work">
    {$scanner?.description ?? "（未選択）"}
    <a href="javascript:void(0)">選択</a>
  </div>
  <div class="commands">
    <button on:click={doStartScan} disabled={!canScan}>スキャン開始</button>
  </div>
  <div class="title">スキャン文書</div>
  <div class="work">
    {#each scannedDocs as doc (doc.index)}
      <ScannedDoc data={doc} />
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
