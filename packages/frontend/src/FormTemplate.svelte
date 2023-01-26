<script lang="ts">
  import { invalid, valid, validResult, type VResult } from "@/lib/validation";
  import { createEventDispatcher, onMount } from "svelte";

  type DATA_TYPE = { num: number };
  type VALUES_TYPE = { num: string };

  export let data: DATA_TYPE | undefined;
  $: onExternalData(data);
  onMount(() => onExternalData(data));
  let values: VALUES_TYPE;
  const dispatch = createEventDispatcher<{"value-change": VResult<DATA_TYPE>}>();

  function onExternalData(data: DATA_TYPE | undefined): void {
    if( data !== undefined ){
      values = formValues(data);
      dispatch("value-change", validResult(data));
    }
  }

  function formValues(data: DATA_TYPE): VALUES_TYPE {
    return { num: data.num.toString() };
  }

  function validateValues(values: VALUES_TYPE): VResult<DATA_TYPE> {
    const n = parseInt(values.num);
    if( isNaN(n) ){
      return invalid("Not a number", []);
    } else {
      return validResult({ num: n });
    }
  }

  export function validate(): VResult<DATA_TYPE> {
    return validateValues(values);
  }

  function onUserInput(): void {
    const vs = validate();
    if( vs.isValid ){
      data = vs.value;
    } else {
      data = undefined;
      dispatch("value-change", vs);
    }
  }

  function onInternalModify(f: (data: DATA_TYPE) => DATA_TYPE): void {
    if( data !== undefined ){
      data = f(data);
    }
  }

  function doInc(): void {
    onInternalModify(d => Object.assign({}, d, { num: d.num + 1}));
  }
</script>

<input type="text" bind:value={values.num} on:change={onUserInput} />
<button on:click={doInc}>Inc</button>
