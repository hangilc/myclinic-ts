<script lang="ts">
  import type { 用法レコード } from "@/lib/denshi-shohou/presc-info";
  import { isValidUsage } from "../helper";
  import ConvertedIcon from "../icons/ConvertedIcon.svelte";
  import UnconvertedIcon from "../icons/UnconvertedIcon.svelte";

  export let usage: 用法レコード;
</script>
{#if isValidUsage(usage)}
  <ConvertedIcon />
{:else}
  <UnconvertedIcon />
{/if}
