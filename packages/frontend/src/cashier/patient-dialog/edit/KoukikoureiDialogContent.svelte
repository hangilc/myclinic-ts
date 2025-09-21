<script lang="ts">
  import { errorMessagesOf, type VResult } from "@/lib/validation";
  import type { Patient, Koukikourei } from "myclinic-model";
  import KoukikoureiForm from "./KoukikoureiForm.svelte";
  import { dateToSql } from "@/lib/util";
  import OnshiKakuninDialog from "@/lib/OnshiKakuninDialog.svelte";
  import type { Hoken } from "../hoken";
  import api from "@/lib/api";
  import { batchFromHoken } from "../fetch-hoken-list";
  import Refer from "./refer/Refer.svelte";
  import { KoukikoureiFormValues } from "./koukikourei-form-values";

  export let patient: Patient;
  export let init: Koukikourei | null;
  export let onEnter: (data: Koukikourei) => Promise<string[]>;
  export let onClose: () => void;
  let validate: (() => VResult<Koukikourei>) | undefined = undefined;
  let errors: string[] = [];
  let showRefer = false;
  let formValues = init ? KoukikoureiFormValues.fromKoukikourei(init) : new KoukikoureiFormValues(patient.patientId);

  async function doEnter() {
    if (validate) {
      const vs = validate();
      if (vs.isValid) {
        errors = [];
        const errs = await onEnter(vs.value);
        if (errs.length === 0) {
          onClose();
        } else {
          errors = errs;
        }
      } else {
        errors = errorMessagesOf(vs.errors);
      }
    } else {
      throw new Error("uninitialized validator");
    }
  }

  function doClose() {
    onClose();
  }

  async function doOnshiConfirm() {
    if (validate) {
      const vs = validate();
      if (vs.isValid) {
        errors = [];
        const hoken = vs.value;
        let confirmDate: string;
        if (hoken.validUpto === "0000-00-00") {
          confirmDate = dateToSql(new Date());
        } else {
          confirmDate = hoken.validUpto;
        }
        const d: OnshiKakuninDialog = new OnshiKakuninDialog({
          target: document.body,
          props: {
            destroy: () => d.$destroy(),
            hoken,
            confirmDate,
            onOnshiNameUpdated: (updated) => {
              patient = updated;
            },
          },
        });
      } else {
        errors = errorMessagesOf(vs.errors);
      }
    } else {
      throw new Error("uninitialized validator");
    }
  }

  async function initRefer(): Promise<Hoken[]> {
    let [shahokokuhoList, koukikoureiList, roujinList, kouhiList] =
      await api.listAllHoken(patient.patientId);
    const hs: Hoken[] = await batchFromHoken(
      shahokokuhoList,
      koukikoureiList,
      roujinList,
      kouhiList
    );
    hs.sort((a, b) => -a.validFrom.localeCompare(b.validFrom));
    return hs;
  }

  async function doReferAnother() {
    if (!showRefer) {
      showRefer = true;
    } else {
      showRefer = false;
    }
  }

  function doReferModify() {
    formValues = formValues;
  }
</script>

<div>
  <div class="form-wrapper">
    {#if showRefer}
      <Refer init={initRefer} src={({ kind: "koukikourei", koukikourei: formValues})} onModify={doReferModify}/>
    {/if}
    <div>
      {#if errors.length > 0}
        <div class="error">
          {#each errors as e}
            <div>{e}</div>
          {/each}
        </div>
      {/if}
      <KoukikoureiForm {patient} values={formValues} bind:validate/>
    </div>
  </div>
  <!-- svelte-ignore a11y-invalid-attribute -->
  <div class="commands">
    <a href="javascript:void(0)" on:click={doReferAnother}>別保険参照</a>
    <a href="javascript:void(0)" on:click={doOnshiConfirm}>資格確認</a>
    <button on:click={doEnter}>入力</button>
    <button on:click={doClose}>キャンセル</button>
  </div>
</div>

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
    align-items: center;
    margin-top: 10px;
  }

  .commands * + * {
    margin-left: 4px;
  }
</style>
