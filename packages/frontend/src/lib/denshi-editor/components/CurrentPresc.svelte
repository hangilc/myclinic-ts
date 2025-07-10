<script lang="ts">
  import { toZenkaku } from "@/lib/zenkaku";
  import type {
    PrescInfoWrapper,
    RP剤情報Wrapper,
    薬品情報Wrapper,
  } from "../denshi-tmpl";
  import { drugRep } from "../helper";
  import { daysTimesDisp } from "@/lib/denshi-shohou/disp/disp-util";
  import ConvDrugValidity from "./ConvDrugValidity.svelte";
  import ConvUsageValidity from "./ConvUsageValidity.svelte";

  export let data: PrescInfoWrapper;
  export let onDrugSelect: (
    group: RP剤情報Wrapper,
    drug: 薬品情報Wrapper,
  ) => void;
  export let showValid: boolean = false;
  export let selectedGroupId: number;
  export let selectedDrugId: number;

  function doDrugSelect(group: RP剤情報Wrapper, drug: 薬品情報Wrapper) {
    selectedGroupId = group.id;
    selectedDrugId = drug.id;
    onDrugSelect(group, drug);
  }
</script>

<div>
  <div class="groups">
    {#each data.RP剤情報グループ as group, index (group.id)}
      <div class:group-selected={selectedGroupId === group.id} class="group">
        <div>{toZenkaku((index + 1).toString())}）</div>
        <div>
          {#each group.薬品情報グループ as drug (drug.id)}
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div class="drug-rep" on:click={() => doDrugSelect(group, drug)} 
              class:drug-selected={drug.id === selectedDrugId}>
              {#if showValid}
                <ConvDrugValidity {drug} />
              {/if}
              <span>{drugRep(drug.toDenshi())}</span>
            </div>
          {/each}
          <div class="usage-rep">
            {#if showValid}
              <ConvUsageValidity usage={group.data.用法レコード} />
            {/if}
            {group.data.用法レコード.用法名称}
            {daysTimesDisp(group.toDenshi())}
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .group {
    display: grid;
    grid-template-columns: auto 1fr;
    padding: 2px;
    margin-bottom: 6px;
  }

  .drug-rep,
  .usage-rep {
    cursor: pointer;
  }

  .group-selected {
    border: 2px solid green;
  }

  .drug-selected {
    text-decoration: underline;
  }
</style>
