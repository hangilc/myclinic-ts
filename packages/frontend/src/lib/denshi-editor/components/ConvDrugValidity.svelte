<script lang="ts">
  import type { 薬品情報 } from "@/lib/denshi-shohou/presc-info";
  import { isValidDrug } from "../helper";
  import ConvertedIcon from "../icons/ConvertedIcon.svelte";
  import UnconvertedIcon from "../icons/UnconvertedIcon.svelte";

  export let drug: 薬品情報;
</script>
{#if isValidDrug(drug)}
  <ConvertedIcon />
{:else}
  <UnconvertedIcon />
{/if}
