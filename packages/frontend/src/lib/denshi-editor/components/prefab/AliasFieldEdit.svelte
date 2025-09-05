<script lang="ts">
  import type { IyakuhinMaster } from "myclinic-model";
  import IyakuhinSearchForm from "../IyakuhinSearchForm.svelte";

  export let value: string;
  export let onCancel: () => void;
  export let onDelete: () => void;
  export let onEnter: (value: string) => void;

  function doMasterSelect(m: IyakuhinMaster, ippanmei: boolean) {
    onEnter(ippanmei ? m.ippanmei : m.name);
  }

</script>

<div class="top">
  <IyakuhinSearchForm onSelect={doMasterSelect} inputText={value}/>
</div>

<style>
</style>
