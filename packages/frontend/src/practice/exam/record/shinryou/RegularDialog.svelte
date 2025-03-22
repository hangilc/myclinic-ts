<script lang="ts">
	import Dialog from "@/lib/Dialog.svelte";
	import CheckLabel from "@/lib/CheckLabel.svelte";
	import {
		ConductKind,
		Shinryou,
		ShinryouEx,
		Visit,
		type VisitEx,
	} from "myclinic-model";
	import { type ConductSpec, enter } from "./helper";
	import api from "@/lib/api";
	import { DateWrapper } from "myclinic-util";
	import { adapToShoshinoIryouJouhou } from "./iryou-jouhou-santei";
    import type { ShinryouCheckProc } from "./record-shinryou-types";

	export let destroy: () => void;
	export let visit: VisitEx;
	export let names: Record<string, string[]>;
	let leftItems: Item[] = [];
	let rightItems: Item[] = [];
	let bottomItems: Item[] = [];

	init();

	function findItemByLabel(items: Item[], label: string): Item | undefined {
		for (let item of items) {
			if (item.label === label) {
				return item;
			}
		}
		return undefined;
	}

	function checkItemByLabel(label: string, checked: boolean) {
		let item: Item | undefined;
		item = findItemByLabel(leftItems, label);
		if (item) {
			item.checked = checked;
			leftItems = leftItems;
			return;
		}
		item = findItemByLabel(rightItems, label);
		if (item) {
			item.checked = checked;
			rightItems = rightItems;
			return;
		}
		item = findItemByLabel(bottomItems, label);
		if (item) {
			item.checked = checked;
			bottomItems = bottomItems;
			return;
		}
	}

	interface Item {
		label: string;
		checked: boolean;
	}

	function setupItems(names: Record<string, string[]>): void {
		leftItems = names.left.map((name) => ({ label: name, checked: false }));
		rightItems = names.right.map((name) => ({ label: name, checked: false }));
		bottomItems = names.bottom.map((name) => ({ label: name, checked: false }));
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
			.map((item) => item.label);
		const regularNames: string[] = [];
		const conductSpecs: ConductSpec[] = [];
		selectedNames.forEach((name) => {
			if (name in conductReqMap) {
				conductSpecs.push(conductReqMap[name]);
			} else {
				regularNames.push(name);
				if (name === "生活習慣病管理料２") {
					regularNames.push("外来データ提出加算（生活習慣病管理料１・２）");
				}
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
		if (label === "初診") {
			procs.push(...(await adapToShoshinoIryouJouhou(visit, checked)));
		}
		for(let proc of procs){
			checkItemByLabel(proc.label, proc.check);
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
