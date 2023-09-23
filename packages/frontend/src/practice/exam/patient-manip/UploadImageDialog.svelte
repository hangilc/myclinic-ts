<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import { getFileExtension } from "@/lib/file-ext";
  import { pad } from "@/lib/pad";
  import { currentPatient } from "../ExamVars";
  import api from "@/lib/api";
  import { popupTrigger } from "@/lib/popup-helper";

  export let destroy: () => void;
  const initTag = "other";
  let tag: string = initTag;
  // let exampleAnchor: HTMLElement;
  let examples: [string, string][] = [
    ["画像", "image"],
    ["保険証", "hokensho"],
    ["健診結果", "checkup"],
    ["在宅報告", "zaitaku"],
    ["同意書", "douisho"],
    ["その他", "other"],
  ];
  let fileInput: HTMLInputElement;
  // let form: HTMLFormElement;

  async function doSave() {
    const patient = $currentPatient;
    if (patient == null) {
      return;
    }
    const formData = new FormData();
    const files = fileInput.files;
    if (files == null || files.length === 0) {
      return;
    } else if (files.length === 1) {
      const f = files[0];
      const ext = getFileExtension(f.name);
      const fn = composeFileName(patient.patientId, tag, new Date(), 0, ext);
      formData.append("uploadfile-1", f, fn);
    } else {
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const ext = getFileExtension(f.name);
        const fn = composeFileName(
          patient.patientId,
          tag,
          new Date(),
          i + 1,
          ext
        );
        formData.append(`uploadfile-${1 + 1}`, f, fn);
      }
    }
    await api.uploadPatientImage(patient.patientId, formData);
    destroy();
  }

  function zeroPad(n: number): string {
    return pad(n, 2, "0");
  }

  function composeFileName(
    patientId: number,
    tag: string,
    at: Date,
    index: number,
    ext: string | undefined
  ): string {
    const year = at.getFullYear();
    const month = zeroPad(at.getMonth() + 1);
    const day = zeroPad(at.getDate());
    const hour = zeroPad(at.getHours());
    const minute = zeroPad(at.getMinutes());
    const second = zeroPad(at.getSeconds());
    const stamp = `${year}${month}${day}-${hour}${minute}${second}`;
    const indexPart = index <= 0 ? "" : `-${index}`;
    const extPart = ext === undefined ? "" : "." + ext;
    return `${patientId}-${tag}-${stamp}${indexPart}${extPart}`;
  }

  function doClose(): void {
    console.log("close");
    destroy();
  }
</script>

<Dialog {destroy} title="画像保存">
  <div class="tag-wrapper">
    Tag: <input type="text" bind:value={tag} />
    <a href="javascript:void(0)" on:click={popupTrigger(() => examples.map(e => [
      e[0], () => tag = e[1]
    ]))}>例</a>
    <!-- <div class="popup-menu" slot="menu">
        {#each examples as e}
          <a
            href="javascript:void(0)"
            on:click={() => {
              destroy();
              tag = e[1];
            }}>{e[0]}</a
          >
        {/each}
      </div> -->
  </div>
  <form>
    <input type="file" bind:this={fileInput} multiple />
  </form>
  <div class="commands">
    <button on:click={doSave}>保存</button>
    <button on:click={doClose}>キャンセル</button>
  </div>
</Dialog>

<style>
  .tag-wrapper {
    margin: 10px 0;
  }

  .popup-menu a {
    display: block;
    margin-bottom: 4px;
    color: black;
  }

  .popup-menu a:last-of-type {
    margin-bottom: 0;
  }

  .commands {
    margin-top: 10px;
    display: flex;
    justify-content: flex-end;
  }

  .commands * + button {
    margin-left: 4px;
  }
</style>
