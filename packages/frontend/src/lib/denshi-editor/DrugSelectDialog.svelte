<script lang="ts">
  import Dialog2 from "@/lib/Dialog2.svelte";
  import type { RP剤情報 } from "@/lib/denshi-shohou/presc-info";
  import {
  DrugSelectDrug,
    DrugSelectGroup,
    getSelectedGroups,
  } from "./components/presc-search/drug-select-type";
  import { daysTimesDisp } from "@/lib/denshi-shohou/disp/disp-util";
  import { toZenkaku } from "@/lib/zenkaku";
  import { drugRep } from "./helper";

  export let destroy: () => void;
  export let src: RP剤情報[];
  export let onEnter: (value: RP剤情報[]) => void;
  let groups: DrugSelectGroup[] = src.map((s) => new DrugSelectGroup(s, false));

  function doCancel() {
    destroy();
  }

  function doEnter() {
    let value = getSelectedGroups(groups);
    destroy();
    onEnter(value);
  }

  function onGroupChange(group: DrugSelectGroup) {
    if (group.selected) {
      group.drugs.forEach((d) => (d.selected = true));
    } else {
      group.drugs.forEach((d) => (d.selected = false));
    }
    groups = groups;
  }

  function onDrugChange(drug: DrugSelectDrug, group: DrugSelectGroup) {
    if (drug.selected) {
      group.selected = true;
    } else {
      if (group.drugs.every((d) => !d.selected)) {
        group.selected = false;
      }
    }
    groups = groups;
  }
</script>

<Dialog2 title="薬剤選択" {destroy}>
  <div class="groups">
    {#each groups as group, index}
      <div>
        <input
          type="checkbox"
          bind:checked={group.selected}
          on:change={() => onGroupChange(group)}
        />
        {toZenkaku((index + 1).toString())}）
      </div>
      <div>
        <div class="drugs">
          {#each group.drugs as drug}
            <div>
              <input
                type="checkbox"
                bind:checked={drug.selected}
                on:change={() => {
                  onDrugChange(drug, group);
                }}
              />
            </div>
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
  <div>
    <button on:click={doEnter}>決定</button>
    <button on:click={doCancel}>キャンセル</button>
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
