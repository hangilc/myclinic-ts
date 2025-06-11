<script lang="ts">
  import Dialog2 from "@/lib/Dialog2.svelte";
  import type { PrescInfoData, RP剤情報, 薬品情報 } from "@/lib/denshi-shohou/presc-info";
  import PrescRep from "./PrescRep.svelte";
  import NewDrug from "./NewDrug.svelte";

  export let destroy: () => void;
  export let data: PrescInfoData;
  let formElement: HTMLElement;
  let clearForm: () => void = () => {};
  let at = shohouDateToSqlDate(data.処方箋交付年月日);

  function shohouDateToSqlDate(shohouDate: string): string {
	let y = shohouDate.substring(0, 4);
	let m = shohouDate.substring(4, 6);
	let d = shohouDate.substring(6,8);
	return `${y}-${m}-${d}`;
  }

  function doAddDrug(group: RP剤情報) {
	clearForm();
	const e: NewDrug = new NewDrug({
	  target: formElement,
	  props: {
		at,
		onDone: () => {
		  clearForm();
		},
		onEnter: drug => {
		  const drugInfo: 薬品情報 = {
			薬品レコード: drug
		  }
		  group.薬品情報グループ.push(drugInfo);
		  data = data;
		}
	  }
	});
	clearForm = () => e.$destroy();
  }
</script>

<Dialog2 title="電子処方箋編集" {destroy}>
  <div class="top">
    <div class="rep"><PrescRep {data} onAddDrug={doAddDrug} /></div>
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
