<script lang="ts">
  import Title from "./workarea/Title.svelte";
  import Workarea from "./workarea/Workarea.svelte";
  import Commands from "./workarea/Commands.svelte";
  import type { RP剤情報Edit } from "../denshi-edit";
  import SelectDrugForm from "./SelectDrugForm.svelte";
  import { toHankaku } from "@/lib/zenkaku";

  export let groups: RP剤情報Edit[];
  export let onClose: () => void;
  export let onModified: () => void;
  
  function doClose() {
    onClose();
  }

  function doChangeDays() {
    const gs: RP剤情報Edit[] = groups.filter(group => {
      return group.isSelected && group.剤形レコード.剤形区分 === "内服"
    });
    if( gs.length === 0 ){
      return;
    }
    let input = prompt("新しい日数");
    if( input == null ){
      return;
    }
    input = toHankaku(input);
    const newDays = parseInt(input);
    if( isNaN(newDays) || newDays <= 0 ){
      alert("日数が正の整数でありません。")
      return 
    }
    gs.forEach(group => {
      group.剤形レコード.調剤数量 = newDays;
    })
    groups = groups;
    onModified();
  }
</script>

<Workarea>
  <Title>選択操作</Title>
  <div>
    <SelectDrugForm {groups} />
  </div>
  <Commands>
    <button on:click={doChangeDays}>日数変更</button>
    <button on:click={doClose}>閉じる</button>
  </Commands>
</Workarea>
