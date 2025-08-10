<script lang="ts">
  import { toZenkaku } from "@/lib/zenkaku";
  import { drugRep } from "../helper";
  import { daysTimesDisp } from "@/lib/denshi-shohou/disp/disp-util";
  import ConvDrugValidity from "./ConvDrugValidity.svelte";
  import ConvUsageValidity from "./ConvUsageValidity.svelte";
  import type { PrescInfoDataEdit, RP剤情報Edit, 薬品情報Edit } from "../denshi-edit";

  export let data: PrescInfoDataEdit;
  export let onDrugSelect: (
    group: RP剤情報Edit,
    drug: 薬品情報Edit,
  ) => void;
  export let showValid: boolean = false;

  function doDrugSelect(group: RP剤情報Edit, drug: 薬品情報Edit) {
    onDrugSelect(group, drug);
  }
</script>

<div>
  <div class="groups">
    {#each data.RP剤情報グループ as group, index (group.id)}
      <div class:group-selected={group.isSelected} class="group">
        <div>{toZenkaku((index + 1).toString())}）</div>
        <div>
          {#each group.薬品情報グループ as drug (drug.id)}
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div class="drug-rep" on:click={() => doDrugSelect(group, drug)} 
              class:drug-selected={drug.isSelected}>
              {#if showValid}
                <ConvDrugValidity {drug} />
              {/if}
              <span>{drugRep(drug)}</span>
            </div>
          {/each}
          <div class="usage-rep">
            {#if showValid}
              <ConvUsageValidity usage={group.用法レコード} />
            {/if}
            {group.用法レコード.用法名称}
            {daysTimesDisp(group)}
            {#if group.用法補足レコード}
              {#each group.用法補足レコード as rec (rec.id)}
                <div>{rec.用法補足情報}</div>
              {/each}
            {/if}
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
