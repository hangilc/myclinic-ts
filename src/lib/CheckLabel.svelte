<script lang="ts">
  import { genid } from "@/lib/genid"

  export let label: string;
  export let checked: (value: boolean) => void;
  const id = genid("check-label-");
  let input: HTMLInputElement;

  function onChange(e: Event): void {
    checked(input.checked);
  }
</script>


<input type="checkbox" on:change={onChange} id={id} bind:this={input} />
<label for={id}>{label}</label>