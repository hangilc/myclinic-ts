<script lang="ts">
  import { toZenkaku } from "@/lib/zenkaku";
  import { daysTimesDisp } from "../denshi-shohou/disp/disp-util";
  import PlusCircle from "@/icons/PlusCircle.svelte";
  import {
    type RP剤情報Indexed,
    type 薬品情報Indexed,
  } from "./denshi-editor-types";
  import { drugRep } from "./helper";

  export let groups: RP剤情報Indexed[];
  // export let onAddDrug: (greoup: RP剤情報Indexed) => void;
  export let onDrugSelect: (g: RP剤情報Indexed, d: 薬品情報Indexed) => void;
  export let onUsageSelect: (g: RP剤情報Indexed) => void;

  let zspc = "　";
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<div>
  <div class="groups">
    {#each groups as group, index (group.id)}
      <div>{toZenkaku((index + 1).toString())}）</div>
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div>
        <div>
          {#each group.薬品情報グループ as drug (drug.id)}
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div class="drug-rep" on:click={() => onDrugSelect(group, drug)}>
              {drugRep(drug)}
            </div>
          {/each}
        </div>
        <div>
          <!-- <a
            href="javascript:void(0)"
            class="plus"
            on:click={() => onAddDrug(group)}
          >
            <PlusCircle color="green" />
          </a> -->
        </div>
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div class="usage-rep" on:click={() => onUsageSelect(group)}>
          {group.用法レコード.用法名称}{zspc}{daysTimesDisp(group)}
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .groups {
    display: grid;
    grid-template-columns: auto 1fr;
  }

  .drug-rep,
  .usage-rep {
    cursor: pointer;
  }
</style>
