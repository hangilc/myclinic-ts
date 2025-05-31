<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import type { FileInfo, Patient } from "myclinic-model";

  import SelectItem from "@/lib/SelectItem.svelte";
  import { writable, type Writable } from "svelte/store";
  import api from "@/lib/api";
  import { FormatDate } from "myclinic-util";

  export let destroy: () => void;
  export let patient: Patient;
  export let files: FileInfo[];
  let selected: Writable<FileInfo | null> = writable(null);
  let imageUrl: string | undefined = undefined;
  let extImageUrl: string | undefined = undefined;
  let imageWidth: number = 560;

  const title = `保存画像（${patient.fullName("")}）`;
  files.sort(cmp);

  selected.subscribe(async (file) => {
    imageUrl = undefined;
    extImageUrl = undefined;
    if (file) {
      const name = file.name;
      const i = name.lastIndexOf(".");
      if (i >= 0) {
        const ext = name.substring(i + 1, name.length);
        if (["jpg", "jpeg", "png", "gif"].includes(ext)) {
          imageUrl = api.patientImageUrl(patient.patientId, name);
          return;
        }
      }
      extImageUrl = api.patientImageUrl(patient.patientId, name);
    }
  });

  function extractDate(fname: string): string {
    const m = fname.match(/(\d{4})(\d{2})(\d{2})/);
    if (m) {
      return `${m[1]}-${m[2]}-${m[3]}`;
    } else {
      const n = fname.match(/(\d{4})-(\d{2})-(\d{2})/);
      if (n) {
        return `${n[1]}-${n[2]}-${n[3]}`;
      } else {
        return "0000-00-00";
      }
    }
  }

  function cmp(fa: FileInfo, fb: FileInfo): number {
    return -extractDate(fa.name).localeCompare(extractDate(fb.name));
  }

  function doClose(): void {
    destroy();
  }

  function doShrink(): void {
    imageWidth /= 1.3;
  }

  function doEnlarge(): void {
    imageWidth *= 1.3;
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<Dialog {title} destroy={doClose} styleWidth="600px">
  <div class="top">
    <div class="files select">
      {#each files as file (file.name)}
        <SelectItem {selected} data={file}>
          <div>
            {file.name} ({FormatDate.f2(file.createdAt)})
          </div>
        </SelectItem>
      {/each}
    </div>
    <div class="scale">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        width="24"
        on:click={doShrink}
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6"
        />
      </svg>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        width="24"
        on:click={doEnlarge}
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
        />
      </svg>
    </div>
    <div class="img">
      {#if imageUrl}
        <img src={imageUrl} width={imageWidth} alt="保存された患者画像" />
      {/if}
      {#if extImageUrl}
        <a href={extImageUrl} target="_blank">別ウィンドウで開く</a>
      {/if}
    </div>
  </div>
</Dialog>

<style>
  .files {
    max-height: 140px;
    resize: vertical;
    overflow-y: auto;
  }

  .scale {
    margin: 6px 0;
  }

  .img {
    max-height: 300px;
    overflow: auto;
    resize: vertical;
  }
</style>
