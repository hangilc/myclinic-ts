<script lang="ts">
  import { invalid, valid, validResult, type VResult } from "@/lib/validation";
  import { createEventDispatcher, onMount } from "svelte";

  type DATA_TYPE = number;
  type VALUES_TYPE = string;

  export let data: DATA_TYPE | undefined;
  $: onExternalData(data);
  let values: VALUES_TYPE;
  const dispatch = createEventDispatcher<{"value-change": VResult<DATA_TYPE>}>();
  onMount(() => onExternalData(data));

  function onExternalData(data: number | undefined): void {
    if( data !== undefined ){
      values = formValues(data);
      dispatch("value-change", validResult(data));
    }
  }

  function formValues(data: DATA_TYPE): string {
    return data.toString();
  }

  function validate(): VResult<DATA_TYPE> {
    const d = parseInt(values);
    if( isNaN(d) ){
      return invalid("Invalid number", []);
    } else {
      return validResult(d);
    }
  }

  function doChange(): void {
    const vs = validate();
    if( vs.isValid ){
      data = vs.value;
    } else {
      data = undefined;
      dispatch("value-change", vs);
    }
  }

  function doInc(): void {
    const vs = validate();
    if( vs.isValid && data !== undefined ){
      data = data + 1;
    }
  }
</script>

<input type="text" bind:value={values} on:change={doChange} />
<button on:click={doInc}>Inc</button>
