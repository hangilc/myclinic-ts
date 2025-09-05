<script lang="ts">
  import type { IyakuhinMaster } from "myclinic-model";
  import IyakuhinSearchForm from "../IyakuhinSearchForm.svelte";
  import CancelLink from "../../icons/CancelLink.svelte";
  import TrashLink from "../../icons/TrashLink.svelte";

  export let value: string;
  export let onCancel: () => void;
  export let onDelete: () => void;
  export let onEnter: (value: string) => void;

  function doMasterSelect(m: IyakuhinMaster, ippanmei: boolean) {
    onEnter(ippanmei ? m.ippanmei : m.name);
  }

  function doCancel() {
    onCancel();
  }

  function doDelete() {
    onDelete();
  }

</script>

<div class="top">
  <IyakuhinSearchForm onSelect={doMasterSelect} inputText={value}>
    <svelte:fragment slot="icon-commands">
      <CancelLink onClick={doCancel} />
      <TrashLink onClick={doDelete} />
    </svelte:fragment>
    </IyakuhinSearchForm>
</div>

<style>
</style>
