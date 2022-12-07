<script lang="ts">
  import { Hoken, type HokenType } from "./hoken";
  import type { PatientData } from "./patient-data";
  import SurfaceModal from "@/lib/SurfaceModal.svelte";
  import ShahokokuhoForm from "./edit/ShahokokuhoForm.svelte";
  import { Kouhi, Koukikourei, Shahokokuho } from "myclinic-model";
  import api from "@/lib/api";
  import KoukikoureiForm from "./edit/KoukikoureiForm.svelte";
  import KouhiForm from "./edit/KouhiForm.svelte";

  export let data: PatientData;
  export let hoken: Hoken;
  export let destroy: () => void;
  let errors: string[] = [];
  console.log("enter stack", data.stack);

  let title: string = `${hoken.name}編集`;

  let comp =
    hoken === undefined
      ? undefined
      : Hoken.fold(
          hoken?.value,
          (_) => ShahokokuhoForm,
          (_) => KoukikoureiForm,
          (_) => undefined,
          (_) => KouhiForm
        );

  function exit(): void {
    destroy();
    data.exit();
  }

  function close(): void {
    console.log("closing edit hoken", data.stack);
    destroy();
    console.log("closing edit hoken (before goback)", data.stack);
    data.goback();
  }

  let validate: () => HokenType | string[];

  async function enterHoken(ht: HokenType) {
    if( ht instanceof Shahokokuho ){
      await api.enterShahokokuho(ht);
    } else if( ht instanceof Koukikourei ){
      await api.enterKoukikourei(ht);
    } else if( ht instanceof Kouhi ){
      await api.enterKouhi(ht);
    } else {
      throw new Error("Cannot enter hoken: " + ht);
    }
  }

  async function updateHoken(ht: HokenType) {
    if( ht instanceof Shahokokuho ){
      await api.updateShahokokuho(ht);
    } else if( ht instanceof Koukikourei ){
      await api.updateKoukikourei(ht);
    } else if( ht instanceof Kouhi ){
      await api.updateKouhi(ht);
    } else {
      throw new Error("Cannot update hoken: " + ht);
    }
  }

  async function doEnter() {
    const result: HokenType | string[] = validate();
    if( Array.isArray(result) ){
      errors = result;
    } else {
      await updateHoken(result);
      data.hokenCache.updateWithHokenType(result);
      close();
    }
  }
</script>

<SurfaceModal destroy={exit} {title}>
  {#if errors.length > 0}
    <div class="error">
      {#each errors as e}
        <div>{e}</div>
      {/each}
    </div>
  {/if}
  <svelte:component this={comp} hoken={hoken.value} bind:validate patient={data.patient}/>
  <div class="commands">
    <button on:click={doEnter}>入力</button>
    <button on:click={close}>キャンセル</button>
  </div>
</SurfaceModal>

<style>
  .error {
    color: red;
  }

  .commands {
    display: flex;
    justify-content: right;
    align-items: center;
    margin-top: 10px;
  }

  .commands > * + * {
    margin-left: 4px;
  }
</style>
