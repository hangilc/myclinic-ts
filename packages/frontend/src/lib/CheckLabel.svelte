<script lang="ts">
  import { genid } from "@/lib/genid"

  export let checked: boolean;
  export let label: string;
  const id = genid("check-label-");

</script>


<input type="checkbox" bind:checked={checked} id={id} />
<label for={id}>{label}</label>