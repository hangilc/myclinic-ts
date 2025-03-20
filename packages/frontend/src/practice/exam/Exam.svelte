<script>
	import Header from "./Header.svelte";
	import PatientsByDateBox from "./patients-by-date-box/PatientsByDateBox.svelte";
	import {
		currentPatient,
		showPatientsByDate,
		navPage,
		navTotal,
		gotoPage,
		showAppoints,
		examAlerts,
		showKensaService,
	} from "./exam-vars";
	import PatientDisp from "./patient-disp/PatientDisp.svelte";
	import PatientManip from "./PatientManip.svelte";
	import RecordsWrapper from "./RecordsWrapper.svelte";
	import Nav from "../../lib/Nav.svelte";
	import MishuuList from "./mishuu-list/MishuuList.svelte";
	import Disease from "./disease/Disease.svelte";
	import Appointments from "./appointsments/Appointments.svelte";
	import Epoch from "./Epoch.svelte";
	import KensaKekka from "./KensaKekka.svelte";

	export let isVisible = false;
</script>

<div style:display={isVisible ? "" : "none"} class="top">
	<div class="exam-left">
		<Header />
		{#if $currentPatient !== null}
			<PatientDisp patient={$currentPatient} />
			<PatientManip />
			{#if $examAlerts.length > 0}
				<div class="exam-alerts">
					{#each $examAlerts as alert}
						<div>{alert}</div>
					{/each}
				</div>
			{/if}
			<Nav page={$navPage} total={$navTotal} {gotoPage} />
			<RecordsWrapper />
			<Nav page={$navPage} total={$navTotal} {gotoPage} />
		{/if}
	</div>
	<div class="exam-right">
		<Disease />
		<MishuuList />
		{#if $showAppoints}
			<Appointments />
		{/if}
		{#if $showPatientsByDate}
			<PatientsByDateBox />
		{/if}
		{#if $showKensaService}
			<KensaKekka />
		{/if}
		{#if $currentPatient}
			<Epoch />
		{/if}
	</div>
</div>

<style>
	.top {
		display: flex;
		align-items: flex-start;
	}

	.exam-left {
		flex: 1 1 auto;
		margin-right: 10px;
	}

	.exam-left > :global(.patient-disp) {
		margin-bottom: 10px;
	}

	.exam-left > :global(.patient-manip) {
		margin: 10px 0;
	}

	.exam-left > :global(.nav) {
		margin: 10px 0;
	}

	.exam-right {
		flex: 0 0 240px;
		width: 240px;
	}

	.exam-alerts {
		margin: 10px 0;
		border: 1px solid red;
		padding: 10px;
		color: red;
	}
</style>
