<script lang="ts">
  import Dialog from "../Dialog.svelte";
  import type { RP剤情報 } from "./presc-info";
  import ShohouForm from "./ShohouForm.svelte";

  export let destroy: () => void;
  export let at: string;
  export let onEnter: (drug: RP剤情報) => void;

  function doEnter(drug: RP剤情報) {
    destroy();
    onEnter(drug);
  }
</script>

<Dialog title="新規薬剤" {destroy} styleWidth="360px">
  <ShohouForm {at} let:enter onEnter={doEnter}>
    <slot>
      <div>
        <button on:click={enter}>入力</button>
      </div>
    </slot>
    </ShohouForm>
</Dialog>