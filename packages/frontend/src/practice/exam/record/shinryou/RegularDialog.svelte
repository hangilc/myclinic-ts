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

	export let destroy: () => void;
	export let visit: VisitEx;
	export let names: Record<string, string[]>;
	let leftItems: Item[] = [];
	let rightItems: Item[] = [];
	let bottomItems: Item[] = [];
	const code医療情報取得加算初診 = 111703270; // 医療情報取得加算（初診）
	const code医療情報取得加算再診 = 112708970; // 医療情報取得加算（再診）：112708970

	init();
	probeIryouJouhouShutoku();

	function checkShoshinSaishin(
		shinryouList: ShinryouEx[],
	): "shoshin" | "saishin" | "other" {
		for (let s of shinryouList) {
			let name = s.master.name;
			if (name.startsWith("初診")) {
				return "shoshin";
			} else if (name.startsWith("再診")) {
				return "saishin";
			}
		}
		return "other";
	}

	async function collectPrevVisits(nMonths: number): Promise<Visit[]> {
		let prevVisits: Visit[] = await api.listVisitByPatientReverse(
			visit.patient.patientId,
			0,
			20,
		);
		let result: Visit[] = [];
		for (let v of prevVisits) {
			if (v.visitedAt > visit.visitedAt) {
				// ignore newer visits
				continue;
			} else if (v.visitId === visit.visitId) {
				// ignore current visit
				continue;
			} else {
				let curYm = visit.visitedAt.substring(0, 7);
				let ym = DateWrapper.fromSqlDatetime(visit.asVisit.visitedAt)
					.getFirstDayOfSameMonth()
					.incMonth(-2)
					.asSqlDate()
					.substring(0, 7);
				let at = v.visitedAt.substring(0, 7);
				if (at >= ym && at <= curYm) {
					result.push(v);
				} else {
					break;
				}
			}
		}
		return result;
	}

	async function listShinryouOfVisits(visitIds: number[]): Promise<Shinryou[]> {
		return (await Promise.all(
			visitIds.map(visitId => api.listShinryouForVisit(visitId))
		)).flat();
	}

	function shinryouListIncludes(list: Shinryou[], shinryoucode: number): boolean {
		for(let s of list){
			if( s.shinryoucode === shinryoucode ){
				return true;
			}
		}
		return false;
	}

	async function probeIryouJouhouShutokuShoshin() {
		let visits = await collectPrevVisits(1);
		let shinryouList = await listShinryouOfVisits(visits.map(v => v.visitId));
		if( shinryouListIncludes(shinryouList, code医療情報取得加算初診) ){
			return;
		}
	}

	async function probeIryouJouhouShutokuSaishin() {
		let visits: Visit[] = await api.listVisitByPatientReverse(
			visit.patient.patientId,
			0,
			20,
		);
		let ym = DateWrapper.fromSqlDatetime(visit.asVisit.visitedAt)
			.getFirstDayOfSameMonth()
			.incMonth(-2)
			.asSqlDate()
			.substring(0, 7);
		visits = visits.filter(
			(v) =>
				v.visitId !== visit.visitId &&
				(v.shahokokuhoId > 0 || v.koukikoureiId > 0) &&
				v.visitedAt.substring(0, 7) >= ym,
		);
		let result: Shinryou[] = (
			await Promise.all(
				visits.map((visit) => api.listShinryouForVisit(visit.visitId)),
			)
		).flat();
		let prevFound = result.some((s) => s.shinryoucode === 112708970);
		console.log("prevFound", prevFound);
	}

	async function probeIryouJouhouShutoku() {
		switch (checkShoshinSaishin(visit.shinryouList)) {
			case "shoshin": {
				await probeIryouJouhouShutokuShoshin();
				return;
			}
			case "saishin": {
				await probeIryouJouhouShutokuSaishin();
				return;
			}
			default: {
				// nop
			}
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
