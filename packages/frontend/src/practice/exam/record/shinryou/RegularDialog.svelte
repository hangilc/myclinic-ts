<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import CheckLabel from "@/lib/CheckLabel.svelte";
  import {
	ConductKind,
	type VisitEx,
  } from "myclinic-model";
  import { type ConductSpec, enter } from "./helper";
  import {
	adaptToShoshinForIryouJouhou,
	adaptToSaishinForIryouJouhou,
  } from "./santei-check/iryou-jouhou-santei";
  import type { ShinryouCheckProc } from "./santei-check/record-shinryou-types";
  import type { RegularName } from "./regular-names";
  import { adaptToSeikatsuShuukanForGairaiDataTeishutsu } from "./santei-check/gairai-data-santei";
  import { adaptToShoshinForIryouDxSuishin } from "./santei-check/iryou-dx-suishin-santei";

  export let destroy: () => void;
  export let visit: VisitEx;
  export let names: Record<string, RegularName[]>;
  export let dxKasanLevel: number | undefined = undefined;
  let leftItems: Item[] = [];
  let rightItems: Item[] = [];
  let bottomItems: Item[] = [];

  init();

  function findItemByName(items: Item[], name: string): Item | undefined {
	for (let item of items) {
	  if (item.name === name) {
		return item;
	  }
	}
	return undefined;
  }

  function checkItemByName(name: string, checked: boolean) {
	let item: Item | undefined;
	item = findItemByName(leftItems, name);
	if (item) {
	  item.checked = checked;
	  leftItems = leftItems;
	  return;
	}
	item = findItemByName(rightItems, name);
	if (item) {
	  item.checked = checked;
	  rightItems = rightItems;
	  return;
	}
	item = findItemByName(bottomItems, name);
	if (item) {
	  item.checked = checked;
	  bottomItems = bottomItems;
	  return;
	}
  }

  interface Item {
	label: string;
	name: string;
	checked: boolean;
  }

  function regularNameToItem(regularName: RegularName): Item {
	let label: string;
	let name: string;
	if (typeof regularName === "string") {
	  label = regularName;
	  name = label;
	} else {
	  label = regularName.label;
	  name = regularName.name;
	}
	return { label, name, checked: false };
  }

  function setupItems(names: Record<string, RegularName[]>): void {
	leftItems = names.left.map(regularNameToItem);
	rightItems = names.right.map(regularNameToItem);
	bottomItems = names.bottom.map(regularNameToItem);
  }

  function init(): void {
	setupItems(names);
  }

  const conductReqMap: Record<string, ConductSpec> = {
	骨塩定量: {
	  kind: ConductKind.Gazou,
	  labelOption: "骨塩定量に使用",
	  shinryou: ["骨塩定量ＭＤ法"],
	  drug: [],
	  kizai: [{ code: "四ツ切", amount: 1 }],
	},
  };

  async function doEnter() {
	const selectedNames: string[] = [
	  ...leftItems,
	  ...rightItems,
	  ...bottomItems,
	]
	  .filter((item) => item.checked)
	  .map((item) => item.name);
	const regularNames: string[] = [];
	const conductSpecs: ConductSpec[] = [];
	selectedNames.forEach((name) => {
	  if (name in conductReqMap) {
		conductSpecs.push(conductReqMap[name]);
	  } else {
		regularNames.push(name);
	  }
	});
	try {
	  await enter(visit, regularNames, conductSpecs);
	  destroy();
	} catch (ex) {
	  alert(ex);
	}
  }

  async function adaptToCheck(label: string, checked: boolean) {
	  const procs: ShinryouCheckProc[] = [];
	  function pushProcs(newProcs: ShinryouCheckProc[]) {
		procs.push(...newProcs);
	  }
	  switch (label) {
		case "初診": {
		  pushProcs(await adaptToShoshinForIryouJouhou(visit, checked));
		  pushProcs(
			await adaptToShoshinForIryouDxSuishin(visit, checked, dxKasanLevel),
		  );
		  break;
		}
		case "再診": {
		  pushProcs(await adaptToSaishinForIryouJouhou(visit, checked));
		  break;
		}
		case "生活習慣病管理料２": {
		  pushProcs(
			await adaptToSeikatsuShuukanForGairaiDataTeishutsu(
			  visit,
			  checked,
			),
		  );
		  console.log("procs", procs);
		  break;
		}
	  }

	  for (let proc of procs) {
		checkItemByName(proc.name, proc.check);
	  }
	}
</script>

<Dialog {destroy} title="診療行為入力">
  <div class="two-cols">
	<div class="left">
	  {#each leftItems as item}
		{#if item.label.startsWith("---")}
		  <div class="leading" />
		{:else}
		  <div>
			<CheckLabel
			  bind:checked={item.checked}
			  label={item.label}
			  name={item.name}
			  onChange={adaptToCheck}
			/>
		  </div>
		{/if}
	  {/each}
	</div>
	<div class="right">
	  {#each rightItems as item}
		{#if item.label.startsWith("---")}
		  <div class="leading" />
		{:else}
		  <div>
			<CheckLabel
			  bind:checked={item.checked}
			  label={item.label}
			  name={item.name}
			  onChange={adaptToCheck}
			/>
		  </div>
		{/if}
	  {/each}
	</div>
	<div class="bottom-wrapper">
	  <div class="bottom">
		{#each bottomItems as item}
		  <div>
			<CheckLabel
			  bind:checked={item.checked}
			  label={item.label}
			  name={item.name}
			  onChange={adaptToCheck}
			/>
		  </div>
		{/each}
	  </div>
	</div>
  </div>
  <div class="commands">
	<button on:click={doEnter}>入力</button>
	<button on:click={destroy}>キャンセル</button>
  </div>
</Dialog>

<style>
  .two-cols {
	display: grid;
	grid-template-columns: 16em 20em;
  }

  .left {
	padding-right: 5px;
  }

  .leading {
	height: 1em;
  }

  .right {
	padding-left: 5px;
  }

  .bottom-wrapper {
	grid-column-start: 1;
	grid-column-end: 3;
	display: flex;
	justify-content: center;
  }

  .commands {
	display: flex;
	justify-content: right;
	align-items: center;
	margin-bottom: 4px;
	line-height: 1;
  }

  .commands * + * {
	margin-left: 4px;
  }
</style>
