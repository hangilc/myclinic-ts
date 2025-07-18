<script lang="ts">
  import type { PrescInfoDataEdit, 備考レコードEdit } from "../denshi-edit";
  import BikouField from "./BikouField.svelte";
  import ValidUptoField from "./ValidUptoField.svelte";

  export let data: PrescInfoDataEdit;
  export let onValidUptoClick: () => void;
  export let onBikouClick: (record: 備考レコードEdit) => void;
  console.log("data", data);
</script>

<ValidUptoField bind:validUpto={data.使用期限年月日} onClick={onValidUptoClick}/>
<BikouField bind:bikou={data.備考レコード} onClick={onBikouClick}/>