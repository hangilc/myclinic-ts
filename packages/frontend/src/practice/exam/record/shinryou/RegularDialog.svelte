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
	import { checkForIryouJouhouSantei } from "./iryou-jouhou-santei";

	export let destroy: () => void;
	export let visit: VisitEx;
	export let names: Record<string, string[]>;
	let leftItems: Item[] = [];
	let rightItems: Item[] = [];
	let bottomItems: Item[] = [];

	init();
	probeIryouJouhouShutoku();

	function checkItemByName(items: Item[], name: string) {
		for (let item of items) {
			if (item.label === name) {
				item.checked = true;
			}
		}
	}

	function checkLeftItemByName(name: string) {
		checkItemByName(leftItems, name);
		leftItems = leftItems;
	}

	async function probeIryouJouhouShutoku() {
		let result = await checkForIryouJouhouSantei(visit);
		if( result ){
			checkLeftItemByName(result);
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
</script>

<Dialog {destroy} title="診療行為入力">
	<div class="two-cols">
		<div class="left">
			{#each leftItems as item}
				{#if item.label.startsWith("---")}
					<div class="leading" />
				{:else}
					<div>
						<CheckLabel bind:checked={item.checked} label={item.label} />
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
						<CheckLabel bind:checked={item.checked} label={item.label} />
					</div>
				{/if}
			{/each}
		</div>
		<div class="bottom-wrapper">
			<div class="bottom">
				{#each bottomItems as item}
					<div>
						<CheckLabel bind:checked={item.checked} label={item.label} />
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
