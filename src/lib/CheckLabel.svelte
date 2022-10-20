<script lang="ts">
  import { genid } from "@/lib/genid"

  export let checked: boolean;
  export let data: {
    label: string,
    checked: boolean,
    value?: any
  };
  const id = genid("check-label-");
  let input: HTMLInputElement;

</script>


<input type="checkbox" bind:checked={checked} id={id} bind:this={input} />
<label for={id}>{data.label}</label>