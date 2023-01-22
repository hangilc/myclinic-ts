<script lang="ts">
  import api from "@/lib/api";
  import Dialog from "@/lib/Dialog.svelte";
  import { errorMessagesOf, type VResult } from "@/lib/validation";
  import type { Patient, Shahokokuho } from "myclinic-model";
  import ShahokokuhoForm from "./edit/ShahokokuhoForm.svelte";

  export let destroy: () => void;
  export let patient: Patient;
  let validate: () => VResult<Shahokokuho>;
  let errors: string[] = [];
  let enterClicked = false;

  async function doEnter() {
    enterClicked = true;
    const vs = validate();
    if (vs.isValid) {
      console.log(vs.value);
      // await api.enterShahokokuho(vs.value);
      // destroy();
    } else {
      errors = errorMessagesOf(vs.errors);
    }
  }

  function doCancel(): void {
    destroy();
  }

  function revalidate(): void {
    if (enterClicked) {
      console.log("revalidate");
      errors = errorMessagesOf(validate().errors);
    }
  }
</script>

<Dialog {destroy} title="新規社保国保">
  {#if errors.length > 0}
    <div class="error">
      {#each errors as e}
        <div>{e}</div>
      {/each}
    </div>
  {/if}
  <ShahokokuhoForm
    init={undefined}
    {patient}
    bind:validate
    onChange={revalidate}
  />
  <div class="commands">
    <button on:click={doEnter}>入力</button>
    <button on:click={doCancel}>キャンセル</button>
  </div>
</Dialog>

<style>
  .error {
    color: red;
    margin: 10px 0;
  }
  .commands {
    display: flex;
    justify-content: right;
    margin-top: 10px;
  }

  .commands * + * {
    margin-left: 4px;
  }

  .commands button {
    min-width: 5rem;
  }
</style>
