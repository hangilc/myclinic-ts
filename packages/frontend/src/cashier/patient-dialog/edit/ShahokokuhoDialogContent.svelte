<script lang="ts">
  import { errorMessagesOf, type VResult } from "@/lib/validation";
  import type { Patient, Shahokokuho } from "myclinic-model";
  import ShahokokuhoForm from "./ShahokokuhoForm.svelte";
  import { dateToSql } from "@/lib/util";
  import OnshiKakuninDialog from "@/lib/OnshiKakuninDialog.svelte";

  export let patient: Patient;
  export let init: Shahokokuho | null;
  export let onEnter: (data: Shahokokuho) => Promise<string[]>;
  export let onClose: () => void;
  let validate: () => VResult<Shahokokuho>;
  let errors: string[] = [];

  async function doEnter() {
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
  }

  function doClose() {
    onClose();
  }

  async function doOnshiConfirm() {
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
        },
      });
    } else {
      errors = errorMessagesOf(vs.errors);
    }
  }
</script>

<div>
  {#if errors.length > 0}
    <div class="error">
      {#each errors as e}
        <div>{e}</div>
      {/each}
    </div>
  {/if}
  <ShahokokuhoForm {patient} {init} bind:validate />
  <div class="commands">
    <a href="javascript:void(0)" on:click={doOnshiConfirm}>資格確認</a>
    <button on:click={doEnter}>入力</button>
    <button on:click={doClose}>キャンセル</button>
  </div>
</div>

<style>
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
