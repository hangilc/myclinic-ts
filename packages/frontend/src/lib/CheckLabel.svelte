<script lang="ts">
  import { genid } from "@/lib/genid"

  export let checked: boolean;
  export let label: string;
	export let name: string;
	export let onChange: (name: string, checked: boolean) => void = _ => {};
  const id = genid("check-label-");

	function doOnChange() {
		onChange(name, checked);
	}

</script>


<input type="checkbox" bind:checked={checked} id={id} on:change={doOnChange}/>
<label for={id}>{label}</label>
