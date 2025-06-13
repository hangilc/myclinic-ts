<script lang="ts">
  import type { RP剤情報 } from "../denshi-shohou/presc-info";
  import { toZenkaku } from "@/lib/zenkaku";
  import { daysTimesDisp } from "../denshi-shohou/disp/disp-util";
  import PlusCircle from "@/icons/PlusCircle.svelte";
  import { unindex薬品情報, type RP剤情報Indexed, type 薬品情報Indexed } from "./denshi-editor-types";
  
  export let groups: RP剤情報Indexed[];
  export let onAddDrug: (greoup: RP剤情報Indexed) => void;
  export let onDrugSelect: (g: RP剤情報Indexed, d: 薬品情報Indexed) => void;

  let zspc = "　";

</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<div>
  <div class="groups">
    {#each groups as group, index (group.id)}
      <div>{toZenkaku((index + 1).toString())}）</div>
      <div>
        <div>
          {#each group.薬品情報グループ as drug (drug.id)}
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div class="drug-rep" on:click={() => onDrugSelect(group, drug)}>
              {drug.薬品レコード.薬品名称}{zspc}{toZenkaku(
                drug.薬品レコード.分量,
              )}{drug.薬品レコード.単位名}
            </div>
          {/each}
        </div>
        <div>
          <a
            href="javascript:void(0)"
            class="plus"
            on:click={() => onAddDrug(group)}
          >
            <PlusCircle color="green" />
          </a>
        </div>
        <div>
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

  .drug-rep {
    cursor: pointer;
  }
</style>
