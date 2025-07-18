<script lang="ts">
  import type { PrescInfoDataEdit } from "../denshi-edit";
  import ValidUptoField from "./ValidUptoField.svelte";

  export let data: PrescInfoDataEdit;
  export let onValidUptoClick: () => void
</script>

<ValidUptoField bind:validUpto={data.使用期限年月日} onClick={onValidUptoClick}/>