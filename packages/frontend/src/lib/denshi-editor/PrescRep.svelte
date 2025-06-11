<script lang="ts">
  import type { PrescInfoData, RP剤情報 } from "../denshi-shohou/presc-info";
  import { toZenkaku } from "@/lib/zenkaku";
  import { daysTimesDisp } from "../denshi-shohou/disp/disp-util";
  import Plus from "@/icons/Plus.svelte";
  import PlusCircle from "@/icons/PlusCircle.svelte";

  export let data: PrescInfoData;
  export let onAddDrug: (greoup: RP剤情報) => void;

  let zspc = "　";
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<div>
  <div class="groups">
    {#each data.RP剤情報グループ as group, index}
      <div>{toZenkaku((index + 1).toString())}）</div>
      <div>
        <div>
          {#each group.薬品情報グループ as drug}
            <div>
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

</style>
