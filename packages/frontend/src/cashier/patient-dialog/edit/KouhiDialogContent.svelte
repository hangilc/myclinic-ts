<script lang="ts">
  import { errorMessagesOf, type VResult } from "@/lib/validation";
  import type { Patient, Kouhi } from "myclinic-model";
  import KouhiForm from "./KouhiForm.svelte";
  import type { Hoken } from "../hoken";
  import api from "@/lib/api";
  import { batchFromHoken } from "../fetch-hoken-list";
  import Refer from "./refer/Refer.svelte";

  export let patient: Patient;
  export let init: Kouhi | null;
  export let onEnter: (data: Kouhi) => Promise<string[]>;
  export let onClose: () => void;
  let validate: () => VResult<Kouhi>;
  let errors: string[] = [];
  let showRefer = false;

  async function doEnter() {
    const vs = validate();
    if( vs.isValid ){
      errors = [];
      const errs = await onEnter(vs.value);
      if( errs.length === 0 ){
        onClose();
      } else {
        errors = errs;
      }
    } else {
      errors = errorMessagesOf(vs.errors);
    }
  }

  function doClose() {
    onClose();
  }

  async function initRefer(): Promise<Hoken[]> {
    let [shahokokuhoList, koukikoureiList, roujinList, kouhiList] =
      await api.listAllHoken(patient.patientId);
    kouhiList = kouhiList.filter((h) => {
      if (init) {
        return h.kouhiId !== init.kouhiId;
      } else {
        return true;
      }
    });
    const hs: Hoken[] = await batchFromHoken(
      shahokokuhoList,
      koukikoureiList,
      roujinList,
      kouhiList
    );
    return hs;
  }

  async function doReferAnother() {
    if (!showRefer) {
      showRefer = true;
    } else {
      showRefer = false;
    }
  }
</script>

<div>
  <div class="form-wrapper">
    {#if showRefer}
      <Refer init={initRefer} />
    {/if}
    <div>
      {#if errors.length > 0}
        <div class="error">
          {#each errors as e}
            <div>{e}</div>
          {/each}
        </div>
      {/if}
      <KouhiForm {patient} {init} bind:validate />
    </div>
  </div>
  <div class="commands">
    <a href="javascript:void(0)" on:click={doReferAnother}>別保険参照</a>
    <button on:click={doEnter}>入力</button>
    <button on:click={doClose}>キャンセル</button>
  </div>
</div>

<!-- <div>
  {#if errors.length > 0}
    <div class="error">
      {#each errors as e}
        <div>{e}</div>
      {/each}
    </div>
  {/if}
  <KouhiForm {patient} {init} bind:validate/>
  <div class="commands">
    <button on:click={doEnter}>入力</button>
    <button on:click={doClose}>キャンセル</button>
  </div>
</div> -->

<style>
  .form-wrapper {
    display: flex;
    gap: 10px;
  }
  .error {
    margin: 10px 0;
    color: red;
  }
  .commands {
    display: flex;
    justify-content: right;
    margin-top: 10px;
  }

  .commands * + * {
    margin-left: 4px;
  }
</style>
