<script lang="ts">
  import api from "@/lib/api";

  import Dialog from "@/lib/Dialog.svelte";
    import { getFileExtension } from "@/lib/file-ext";
  import SelectItem from "@/lib/SelectItem.svelte";
  import { writable, type Writable } from "svelte/store";

  let dialog: Dialog;
  let list: string[] = [];
  let imgSrc: Writable<string | null> = writable(null);
  let inlineImageSrc: string = "";
  let externalImageSrc: string = "";
  let externals: string[] = ["pdf"];
  let patientId: number = 0;

  imgSrc.subscribe(src => {
    if( src == null ){
      return;
    }
    const ext = getFileExtension(src) ?? "";
    const url = api.patientImageUrl(patientId, src);
    if( externals.includes(ext) ){
      externalImageSrc = url;
      inlineImageSrc = "";
    } else {
      externalImageSrc = "";
      inlineImageSrc = url;
    }
  })

  export async function open(patientIdArg: number) {
    patientId = patientIdArg;
    const files = await api.listPatientImage(patientId);
    list = files.map((f) => f.name);
    dialog.open();
  }
</script>

<Dialog bind:this={dialog} width="300">
  <span slot="title">画像一覧</span>
  <div class="select">
    {#each list as f}
      <SelectItem selected={imgSrc} data={f}>{f}</SelectItem>
    {/each}
  </div>
  {#if inlineImageSrc !== ""}
    <div class="image-wrapper">
      <img src={inlineImageSrc} height="1400px" alt="保存画像"/>
    </div>
  {/if}
  {#if externalImageSrc !== ""}
    <!-- svelte-ignore security-anchor-rel-noreferrer -->
    <a href={externalImageSrc} target="_blank">別のタブで開く</a>
  {/if}
</Dialog>

<style>
  .select {
    height: 6em;
    resize: vertical;
    margin-bottom: 10px;
  }

  .image-wrapper {
    height: 500px;
    overflow: auto;
  }
</style>
