<script lang="ts">
  import Dialog2 from "@/lib/Dialog2.svelte";
  import type { PrescInfoData, 薬品情報 } from "@/lib/denshi-shohou/presc-info";
  import PrescRep from "./PrescRep.svelte";
  import NewDrug from "./NewDrug.svelte";
  import { indexRP剤情報, index薬品情報, unindex薬品情報, type RP剤情報Indexed, type 薬品情報Indexed } from "./denshi-editor-types";
  import EditDrug from "./EditDrug.svelte";

  export let destroy: () => void;
  export let data: PrescInfoData;
  let formElement: HTMLElement;
  let clearForm: () => void = () => {};
  let at = shohouDateToSqlDate(data.処方箋交付年月日);

  let groups: RP剤情報Indexed[] = data.RP剤情報グループ.map(g => indexRP剤情報(g));
  
  function shohouDateToSqlDate(shohouDate: string): string {
	let y = shohouDate.substring(0, 4);
	let m = shohouDate.substring(4, 6);
	let d = shohouDate.substring(6,8);
	return `${y}-${m}-${d}`;
  }

  function doAddDrug(group: RP剤情報Indexed) {
	clearForm();
	const e: NewDrug = new NewDrug({
	  target: formElement,
	  props: {
		at,
		onDone: () => {
		  clearForm();
		},
		onEnter: drug => {
		  group.薬品情報グループ.push(index薬品情報(drug));
		  groups = groups;
		}
	  }
	});
	clearForm = () => e.$destroy();
  }

  function doDrugSelect(group: RP剤情報Indexed, drug: 薬品情報Indexed) {
	clearForm();
	const e: EditDrug = new EditDrug({
	  target: formElement,
	  props: {
		at,
		drug: unindex薬品情報(drug),
		剤形区分: group.剤形レコード.剤形区分,
		onDone: () => {
		  clearForm();
		},
		onEnter: (updated: 薬品情報) => {
		  console.log("onEnter", updated);
		  group.薬品情報グループ =  group.薬品情報グループ.map(
			d => d.id === drug.id ? index薬品情報(updated) : d
		  );
		  console.log("updated", group);
		  groups = groups;
		  console.log("groups", groups);
		},
		onDelete: () => {
		  group.薬品情報グループ = group.薬品情報グループ.filter(d => d.id !== drug.id);
		  groups = groups;
		}
	  }
	});
	clearForm = () => e.$destroy();
	group.薬品情報グループ = group.薬品情報グループ.filter(d => d.id !== drug.id);
	groups = groups;
  }
  
</script>

<Dialog2 title="電子処方箋編集" {destroy}>
  <div class="top">
    <div class="rep"><PrescRep
	  {groups}
	  onAddDrug={doAddDrug}
	  onDrugSelect={doDrugSelect}
	/></div>
    <div class="form" bind:this={formElement}></div>
  </div>
</Dialog2>

<style>
  .top {
    width: 500px;
    height: 600px;
    display: grid;
    grid-template-columns: 30% 1fr;
    gap: 10px;
    padding: 10px;
    overflow-y: auto;
  }
</style>
