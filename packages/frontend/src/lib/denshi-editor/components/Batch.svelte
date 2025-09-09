<script lang="ts">
  import Title from "./workarea/Title.svelte";
  import Workarea from "./workarea/Workarea.svelte";
  import Commands from "./workarea/Commands.svelte";
  import type { RP剤情報Edit } from "../denshi-edit";
  import SelectDrugForm from "./SelectDrugForm.svelte";
  import { toHankaku } from "@/lib/zenkaku";
  import Link from "@/practice/ui/Link.svelte";

  export let groups: RP剤情報Edit[];
  export let onCancel: () => void;
  export let onEnter: (groups: RP剤情報Edit[]) => void;
  
  let working: RP剤情報Edit[] = groups.map(g => g.clone());

  function doCancel() {
    onCancel();
  }

  function doEnter() {
    onEnter(working);
  }

  function doChangeDays() {
    const gs: RP剤情報Edit[] = working.filter(group => {
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
    working = working;
  }

  function doDelete() {
    working.filter(group => group.isSelected)
      .forEach(group => {
        if( group.薬品情報グループ.length === 1){
          group.薬品情報グループ = [];
        } else {
          group.薬品情報グループ = group.薬品情報グループ.filter(drug => !drug.isSelected);
        }
      });
    working = working.filter(group => group.薬品情報グループ.length > 0);
  }
</script>

<Workarea>
  <Title>選択操作</Title>
  <div>
    <SelectDrugForm groups={working} />
  </div>
  <Commands>
    <Link onClick={doChangeDays}>日数変更</Link>
    <Link onClick={doDelete}>削除</Link>
    <button on:click={doEnter}>決定</button>
    <button on:click={doCancel}>キャンセル</button>
  </Commands>
</Workarea>
