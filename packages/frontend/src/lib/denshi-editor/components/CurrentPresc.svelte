<script lang="ts">
  import { toZenkaku } from "@/lib/zenkaku";
  import { daysTimesDisp } from "@/lib/denshi-shohou/disp/disp-util";
  import ConvDrugValidity from "./ConvDrugValidity.svelte";
  import ConvUsageValidity from "./ConvUsageValidity.svelte";
  import type {
    PrescInfoDataEdit,
    RP剤情報Edit,
    薬品情報Edit,
  } from "../denshi-edit";
  import PlusLink from "../icons/PlusLink.svelte";
  import ArrowUpDownLink from "../icons/ArrowUpDownLink.svelte";
  import DrugDisp from "@/lib/denshi-shohou/disp/DrugDisp.svelte";

  export let data: PrescInfoDataEdit;
  export let onDrugSelect: (group: RP剤情報Edit, drug: 薬品情報Edit) => void;
  export let onUsageAndTimesSelect: (group: RP剤情報Edit) => void;
  export let onGroupSelect: (group: RP剤情報Edit) => void;
  export let showValid: boolean = false;
  export let onAddDrug: (group: RP剤情報Edit) => void;
  export let onDrugReorder: (group: RP剤情報Edit) => void;

  function doDrugSelect(group: RP剤情報Edit, drug: 薬品情報Edit) {
    onDrugSelect(group, drug);
  }

  function doAddDrug(group: RP剤情報Edit) {
    onAddDrug(group);
  }

  function doDrugReorder(group: RP剤情報Edit) {
    onDrugReorder(group);
  }

  function doGroupSelect(group: RP剤情報Edit) {
    onGroupSelect(group);
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div>
  <div class="groups">
    {#each data.RP剤情報グループ as group, index (group.id)}
      <div class:group-selected={group.isSelected} class="group">
        <div on:click={() => doGroupSelect(group)}>
          {toZenkaku((index + 1).toString())}）
        </div>
        <div class="drugs">
          {#each group.薬品情報グループ as drug, drugIndex (drug.id)}
            <span>
              {#if showValid}
                <ConvDrugValidity {drug} />
              {/if}
            </span>
            <div
              on:click|stopPropagation={() => doDrugSelect(group, drug)}
              class="drug-rep"
            >
              <DrugDisp {drug}>
                <span slot="post">
                  {#if drugIndex === group.薬品情報グループ.length - 1}
                    <PlusLink
                      onClick={(e) => {
                        e.stopPropagation();
                        doAddDrug(group);
                      }}
                    />
                    {#if group.薬品情報グループ.length > 1}
                      <ArrowUpDownLink
                        onClick={(e) => {
                          e.stopPropagation();
                          doDrugReorder(group);
                        }}
                      />
                    {/if}
                  {/if}
                </span>
              </DrugDisp>
            </div>
          {/each}
          <span>
            {#if showValid}
              <ConvUsageValidity usage={group.用法レコード} />
            {/if}
          </span>
          <div class="usage-rep" on:click={() => onUsageAndTimesSelect(group)}>
            {group.用法レコード.用法名称}
            {daysTimesDisp(group)}
            {#if group.用法補足レコード}
              {#each group.用法補足レコード as rec (rec.id)}
                <div>{rec.用法補足情報}</div>
              {/each}
            {/if}
          </div>
          <!-- {#each group.薬品情報グループ as drug, drugIndex (drug.id)} -->
          <!-- <div class="drug-rep" class:drug-selected={drug.isSelected}>
              <span>
                {#if showValid}
                  <ConvDrugValidity {drug} />
                {/if}
              </span>
              <DrugDisp {drug}>
            </DrugDisp> -->
          <!-- <span on:click|stopPropagation={() => doDrugSelect(group, drug)}>
                {#if showValid}
                  <ConvDrugValidity {drug} />
                {/if}
                <span>{drugRep(drug)}</span>
              </span>
              {#if drugIndex === group.薬品情報グループ.length - 1}
                <PlusLink onClick={() => doAddDrug(group)} />
                {#if group.薬品情報グループ.length > 1}
                  <ArrowUpDownLink onClick={() => doDrugReorder(group)} />
                {/if}
              {/if} -->
          <!-- </div> -->
          <!-- {/each} -->
          <!-- <div class="usage-rep" on:click={() => onUsageAndTimesSelect(group)}>
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
          </div> -->
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
    --ui-plus-link-top: 3px;
  }

  .drugs {
    display: grid;
    grid-template-columns: auto 1fr;
  }

  .drug-rep,
  .usage-rep {
    cursor: pointer;
  }

  .group-selected {
    border: 2px solid green;
  }

</style>
