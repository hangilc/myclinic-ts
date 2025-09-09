<script lang="ts">
  import Title from "./workarea/Title.svelte";
  import Workarea from "./workarea/Workarea.svelte";
  import Commands from "./workarea/Commands.svelte";
  import { RP剤情報Edit } from "../denshi-edit";
  import SelectDrugForm from "./SelectDrugForm.svelte";
  import { toHankaku } from "@/lib/zenkaku";
  import Link from "@/practice/ui/Link.svelte";

  export let groups: RP剤情報Edit[];
  export let onCancel: () => void;
  export let onEnter: (groups: RP剤情報Edit[]) => void;

  let working: RP剤情報Edit[] = groups.map((g) => g.clone());

  function clearSelection() {
    working.forEach((group) => {
      group.isSelected = false;
      group.薬品情報グループ.forEach((drug) => (drug.isSelected = false));
    });
  }

  function doCancel() {
    onCancel();
  }

  function doEnter() {
    onEnter(working);
  }

  function doChangeDays() {
    const gs: RP剤情報Edit[] = working.filter((group) => {
      return group.isSelected && group.剤形レコード.剤形区分 === "内服";
    });
    if (gs.length === 0) {
      return;
    }
    let input = prompt("新しい日数");
    if (input == null) {
      return;
    }
    input = toHankaku(input);
    const newDays = parseInt(input);
    if (isNaN(newDays) || newDays <= 0) {
      alert("日数が正の整数でありません。");
      return;
    }
    gs.forEach((group) => {
      group.剤形レコード.調剤数量 = newDays;
    });
    working = working;
  }

  function doDelete() {
    working
      .filter((group) => group.isSelected)
      .forEach((group) => {
        group.薬品情報グループ = group.薬品情報グループ.filter(
          (drug) => !drug.isSelected,
        );
      });
    working = working.filter((group) => group.薬品情報グループ.length > 0);
    clearSelection();
    working = working;
  }

  function isSelected(index: number) {
    return working[index].isSelected;
  }

  function packingState(): {
    pre: RP剤情報Edit[];
    selected: RP剤情報Edit[];
    inBlock: RP剤情報Edit[];
    post: RP剤情報Edit[];
  } {
    const pre: RP剤情報Edit[] = [];
    const selected: RP剤情報Edit[] = [];
    const inBlock: RP剤情報Edit[] = [];
    const post: RP剤情報Edit[] = [];
    const n = working.length;
    let i = 0;
    for (; i < n; i++) {
      if (isSelected(i)) {
        break;
      } else {
        pre.push(working[i]);
      }
    }
    let j = n - 1;
    for (; j >= 0; j--) {
      if (isSelected(j)) {
        break;
      } else {
        post.unshift(working[j]);
      }
    }
    for (; i <= j; i++) {
      if (isSelected(i)) {
        selected.push(working[i]);
      } else {
        inBlock.push(working[i]);
      }
    }
    return { pre, selected, inBlock, post };
  }

  function pack(ps: {
    pre: RP剤情報Edit[];
    selected: RP剤情報Edit[];
    inBlock: RP剤情報Edit[];
    post: RP剤情報Edit[];
  }, dir: "up" | "down") {
    let i = 0;
    function copy(eles: RP剤情報Edit[]){
      eles.forEach(e => working[i++] = e);
    }
   copy(ps.pre);
   if( dir === "up" ){
     copy(ps.selected);
     copy(ps.inBlock);
   } else {
     copy(ps.inBlock);
     copy(ps.selected);
   }
   copy(ps.post);
  }

  function move(ps: {
    pre: RP剤情報Edit[];
    selected: RP剤情報Edit[];
    post: RP剤情報Edit[];
  }, dir: "up" | "down") {
    let i = 0;
    function copy(eles: RP剤情報Edit[]){
      eles.forEach(e => working[i++] = e);
    }
    if( dir === "up" ){
      let e = ps.pre.pop();
      if( !e ){
        return;
      }
      ps.post.unshift(e);
    } else {
      let e = ps.post.shift();
      if( !e ){
        return;
      }
      ps.pre.push(e);
    }
    copy(ps.pre);
    copy(ps.selected);
    copy(ps.post);
  }

  function doMoveUp() {
    const ps = packingState();
    if (ps.inBlock.length > 0) {
      pack(ps, "up");
    } else {
      move(ps, "up");
    }
    working = working;
  }

  function doMoveDown() {
    const ps = packingState();
    if (ps.inBlock.length > 0) {
      pack(ps, "down");
    } else {
      move(ps, "down");
    }
    working = working;
  }
</script>

<Workarea>
  <Title>選択操作</Title>
  <div>
    <SelectDrugForm groups={working} />
  </div>
  <Commands>
    <Link onClick={doChangeDays}>日数変更</Link>
    <Link onClick={doMoveUp}>上へ</Link>
    <Link onClick={doMoveDown}>下へ</Link>
    <Link onClick={doDelete}>削除</Link>
    <button on:click={doEnter}>決定</button>
    <button on:click={doCancel}>キャンセル</button>
  </Commands>
</Workarea>
