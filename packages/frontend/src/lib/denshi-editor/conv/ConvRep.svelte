<script lang="ts">
  import type { Drug, Shohou } from "@/lib/parse-shohou";
  import type { ConvGroupRep } from "./conv-types";
  import { toZenkaku } from "@/lib/zenkaku";
  import ConvertedIcon from "./conv-widgets/ConvertedIcon.svelte";
  import UnconvertedIcon from "./conv-widgets/UnconvertedIcon.svelte";
  import { drugRep } from "../helper";

  export let groups: ConvGroupRep[];
  export let onDrugSelected: (group: ConvGroupRep, index: number) => void;

  function unconvRep(drug: Drug): string {
    let s = `${drug.name}　${drug.amount}${drug.unit}${drug.uneven ?? ""}`;
    if (drug.drugComments.length > 0) {
      for (let c of drug.drugComments) {
        s += `　${c}`;
      }
    }
    return s;
  }
</script>

<div class="groups">
  {#each groups as group, index (group.id)}
    <div>{toZenkaku(`${(index + 1).toString()}）`)}</div>
    <div>
      {#each group.drugs as drug}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div on:click={() => onDrugSelected(group, index)} class="cursor-pointer">
          {#if drug.converted}
            <ConvertedIcon /> {drugRep(drug.converted)}
          {:else}
            <UnconvertedIcon /> {unconvRep(drug.src)}
          {/if}
        </div>
      {/each}
    </div>
  {/each}
</div>

<style>
  .groups {
    display: grid;
    grid-template-columns: auto 1fr;
  }
</style>
