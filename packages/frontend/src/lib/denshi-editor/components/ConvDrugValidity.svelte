<script lang="ts">
  import type { 薬品情報Wrapper } from "../denshi-tmpl";
  import { isValidDrug } from "../helper";
  import ConvertedIcon from "../icons/ConvertedIcon.svelte";
  import UnconvertedIcon from "../icons/UnconvertedIcon.svelte";

  export let drug: 薬品情報Wrapper;
</script>
{#if isValidDrug(drug)}
  <ConvertedIcon />
{:else}
  <UnconvertedIcon />
{/if}
