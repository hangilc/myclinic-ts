<script lang="ts">
	import api from "@/lib/api";
	import { startPatient, kensaDataClipboard } from "./exam-vars";
	import RightBox from "./RightBox.svelte";
	let showInputBox = true;
	let kensaData = "";
	interface KensaData {
		name: string;
		patientId: number;
		text: string;
	}
	let dataList: { name: string; patientId: number; text: string }[] = [];
	let selectedPatientId = -1;

	function toggleLoad() {
		showInputBox = !showInputBox;
	}

	function parseKensa(t: string): KensaData[] {
		let parts = t.split(/[\r\n]+(?=\d+)/g).filter((s) => s.trim() !== "");
		let result: KensaData[] = [];
		for (let part of parts) {
			let m = part.match(/^(\d+)\s+(\d{4}\/\d{2}\/\d{2})\s+(.+)[\r\n]/);
			if (!m) {
				alert(`Invalid kensa data: ${part}`);
				return [];
			}
			let patientId = parseInt(m[1]);
			let name = m[3];
			let text = part;
			const data = { name, patientId, text };
			result.push(data);
		}
		return result;
	}

	function doLoad() {
		dataList = parseKensa(kensaData);
		showInputBox = false;
	}

	async function openPatient(data: KensaData) {
		kensaDataClipboard.set(data);
		let patient = await api.getPatient(data.patientId);
		startPatient(patient);
		selectedPatientId = data.patientId;
	}
</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<RightBox title="検査結果">
	<div>
		<a href="javascript:void(0)" on:click={toggleLoad}>結果ロード</a>
	</div>

	{#if showInputBox}
		<textarea class="load-data" bind:value={kensaData}></textarea>
		<div>
			<button on:click={doLoad}>ロード</button>
		</div>
	{/if}
	<div class="data-list">
		{#each dataList as data}
			<div>
				<div class:selected={data.patientId === selectedPatientId}>
					<a href="javascript:void(0)" on:click={() => openPatient(data)}
						>{data.name}</a>
				</div>
			</div>
		{/each}
	</div>
</RightBox>

<style>
	.load-data {
		width: 95%;
		height: 200px;
		font-size: 12px;
	}

	.data-list {
		margin-top: 6px;
	}

	.selected {
		font-weight: bold;
		border: 1px solid blue;
		border-radius: 3px;
		padding: 2px;
		margin: 3px 0;
	}
</style>
