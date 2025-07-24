<script lang="ts">
  import Dialog2 from "@/lib/Dialog2.svelte";
  import type { RP剤情報 } from "@/lib/denshi-shohou/presc-info";
  import { DrugSelectGroup } from "./components/presc-search/drug-select-type";
  import { daysTimesDisp } from "@/lib/denshi-shohou/disp/disp-util";
  import { toZenkaku } from "@/lib/zenkaku";
  import { drugRep } from "./helper";

  export let destroy: () => void;
  export let src: RP剤情報[];
  let groups: DrugSelectGroup[] = src.map((s) => new DrugSelectGroup(s, false));
</script>

<Dialog2 title="薬剤選択" {destroy}>
  <div class="groups">
    {#each groups as group, index}
      <div>
        <input type="checkbox" bind:checked={group.selected} />
        {toZenkaku((index + 1).toString())}）
      </div>
      <div>
        <div class="drugs">
          {#each group.drugs as drug}
            <div><input type="checkbox" bind:checked={drug.selected} /></div>
            <div>{drugRep(drug.data)}</div>
          {/each}
        </div>
        <div>
          {group.data.用法レコード.用法名称}
          {daysTimesDisp(group.data)}
        </div>
      </div>
    {/each}
  </div>
</Dialog2>

<style>
  .groups {
    width: 300px;
    padding: 10px;
    max-height: 300px;
    overflow-y: auto;
  }

  .groups,
  .drugs {
    display: grid;
    grid-template-columns: auto 1fr;
  }
</style>
