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
	let dataList: { name: string; patientId: number; text: string }[] = [
		{ name: "ﾀﾅｶｲﾁｲﾛｳ", patientId: 7676, text: "Test Data" },
	];
	let selectedPatientId = -1;
	
	function toggleLoad() {
		showInputBox = !showInputBox;
	}

	function doLoad() {}

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
	<div>
		{#each dataList as data}
			<div>
				<div>
					<a href="javascript:void(0)" on:click={() => openPatient(data)}
						class:selected={data.patientId === selectedPatientId}>{data.name}</a>
				</div>
			</div>
		{/each}
	</div>
</RightBox>

<style>
	.load-data {
		width: 95%;
	}

	.selected {
		font-weight: bold;
	}
</style>
