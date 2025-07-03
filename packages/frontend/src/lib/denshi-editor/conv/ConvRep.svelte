<script lang="ts">
  import type { Drug } from "@/lib/parse-shohou";
  import type { ConvGroupRep } from "./conv-types";
  import { toZenkaku } from "@/lib/zenkaku";
  import ConvertedIcon from "./conv-widgets/ConvertedIcon.svelte";
  import UnconvertedIcon from "./conv-widgets/UnconvertedIcon.svelte";
  import { drugRep, unconvDrugRep, unconvUsageRep, usageRep } from "../helper";

  export let groups: ConvGroupRep[];
  export let onDrugSelected: (group: ConvGroupRep, index: number) => void;
  export let onUsageSelected: (group: ConvGroupRep, name: string) => void;

</script>

<div class="groups">
  {#each groups as group, index (group.id)}
    <div>{toZenkaku(`${(index + 1).toString()}）`)}</div>
    <div>
      <div>
        {#each group.drugs as drug, drugIndex}
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          {#if drug.kind === "converted"}
            <div
              class="cursor-pointer"
              on:click={() => onDrugSelected(group, drugIndex)}
            >
              <ConvertedIcon />
              {drugRep(drug.data)}
            </div>
          {:else}
            <div
              class="cursor-pointer"
              on:click={() => onDrugSelected(group, drugIndex)}
            >
              <UnconvertedIcon />{unconvDrugRep(drug.src)}
            </div>
          {/if}
        {/each}
      </div>
      <div>
        {#if group.usage.kind == "converted"}
          <div><ConvertedIcon />{usageRep(group.usage.data, group.data2)}</div>
        {:else}
          {@const usage = group.usage}
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div
            class="cursor-pointer"
            on:click={() => onUsageSelected(group, usage.src.usage.usage)}
          >
            <UnconvertedIcon />{unconvUsageRep(group.usage.src.usage, group.data2)}
          </div>
        {/if}
      </div>
    </div>
  {/each}
</div>

<style>
  .groups {
    display: grid;
    grid-template-columns: auto 1fr;
  }
</style>
