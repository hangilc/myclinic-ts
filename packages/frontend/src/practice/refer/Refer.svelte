<script lang="ts">
	import ServiceHeader from "@/ServiceHeader.svelte";
	import api from "@/lib/api";
	import DrawerDialog from "@/lib/drawer/DrawerDialog.svelte";
	import { drawRefer } from "@/lib/drawer/forms/refer/refer-drawer";
	import type { ClinicInfo, Patient } from "myclinic-model";
	import { DateWrapper } from "myclinic-util";
	import SearchPatientDialog from "@/lib/SearchPatientDialog.svelte";
	import type { ReferConfig } from "@/lib/refer";
	import ReferConfigDialog from "@/lib/ReferConfigDialog.svelte";
	import ChevronDown from "@/icons/ChevronDown.svelte";
	import PopupMenu from "@/lib/PopupMenu.svelte";
	import type { ReferDrawerData } from "@/lib/drawer/forms/refer/refer-drawer-data";
	import { writable, type Writable } from "svelte/store";
	import VisitsView from "@/lib/VisitsView.svelte";

	export let isVisible = false;
	let title = "紹介状";
	let referHospital = "";
	let referDoctor = "";
	let patientName = "";
	let patientInfo = "";
	let diagnosis = "";
	let content = "";
	let savedContent = "";
	let issueDate = "";
	let address = "";
	let clinicName = "";
	let issuerDoctorName = "";
	let patient: Writable<Patient | undefined> = writable(undefined);
	let clinicInfo: ClinicInfo | undefined = undefined;
	let referConfig: ReferConfig[] = [];

	loadClinicInfo();
	initIssueDate();
	loadConfig();

	function initIssueDate() {
		const today = DateWrapper.from(new Date());
		issueDate = `${today.getGengou()}${today.getNen()}年${today.getMonth()}月${today.getDay()}日`;
	}

	async function loadClinicInfo() {
		if (!clinicInfo) {
			clinicInfo = await api.getClinicInfo();
		}
		const cl = clinicInfo;
		address = `${cl.postalCode}\n${cl.address}\n電話 ${cl.tel}\nＦＡＸ ${cl.fax}`;
		clinicName = cl.name;
		issuerDoctorName = cl.doctorName;
	}

	async function loadConfig() {
		const cfg = await api.getConfig("refer");
		if (cfg != null) {
			referConfig = cfg;
		}
	}

	function initWithPatient(p: Patient) {
		$patient = p;
		patientName = `患者：${p.lastName}${p.firstName}`;
		const bd = DateWrapper.from(p.birthday);
		const sex = p.sex === "M" ? "男" : "女";
		patientInfo = `${bd.getGengou()}${bd.getNen()}年${bd.getMonth()}月${bd.getDay()}日生、${bd.getAge()}才、${sex}性`;
	}

	function composeFormData(): ReferDrawerData {
		return {
			title,
			"refer-hospital": referHospital,
			"refer-doctor": referDoctor,
			"patient-name": patientName,
			"patient-info": patientInfo,
			diagnosis,
			content,
			"issue-date": issueDate,
			address,
			"clinic-name": clinicName,
			"issuer-doctor-name": issuerDoctorName,
		};
	}

	function loadFormData(formData: ReferDrawerData) {
		title = formData.title;
		referHospital = formData["refer-hospital"];
		referDoctor = formData["refer-doctor"];
		patientName = formData["patient-name"];
		patientInfo = formData["patient-info"];
		diagnosis = formData.diagnosis;
		content = formData.content;
		savedContent = content;
		issueDate = formData["issue-date"];
		address = formData.address;
		clinicName = formData["clinic-name"];
		issuerDoctorName = formData["issuer-doctor-name"];
	}

	function doView() {
		const formData = composeFormData();
		let referDoctorValue: string = formData["refer-doctor"].trim();
		if (referDoctorValue === "") {
			referDoctorValue = "                      ";
		}
		referDoctorValue += " 先生御机下";
		let data = Object.assign(formData, { "refer-doctor": referDoctorValue });
		let pages = drawRefer(data);
		const d: DrawerDialog = new DrawerDialog({
			target: document.body,
			props: {
				pages,
				kind: "refer",
				destroy: () => d.$destroy(),
				scale: 2,
			},
		});
	}

	function doSelectPatient() {
		const d: SearchPatientDialog = new SearchPatientDialog({
			target: document.body,
			props: {
				destroy: () => d.$destroy(),
				title: "患者選択",
				onEnter: initWithPatient,
			},
		});
	}

	function contentIsModified(): boolean {
		return savedContent !== content;
	}

	function doClearPatient() {
		if (contentIsModified()) {
			if (!confirm("内容が変更されていますが、このまま終了しますか？")) {
				return;
			}
		}
		$patient = undefined;
		title = "紹介状";
		referHospital = "";
		referDoctor = "";
		patientName = "";
		patientInfo = "";
		diagnosis = "";
		content = "";
		savedContent = content;
		initIssueDate();
		loadClinicInfo();
	}

	async function doConfig() {
		const curr = await api.getConfig("refer");
		const d: ReferConfigDialog = new ReferConfigDialog({
			target: document.body,
			props: {
				destroy: () => d.$destroy(),
				configs: curr,
				onEntered: (list: ReferConfig[]) => {
					referConfig = list;
				},
			},
		});
	}

	function doConfigPopup(evt: MouseEvent) {
		const m: PopupMenu = new PopupMenu({
			target: document.body,
			props: {
				event: evt,
				menu: referConfig.map((cfg) => {
					const label = `${cfg.hospital}:${cfg.section}:${cfg.doctor}`;
					return [
						label,
						() => {
							referHospital = cfg.hospital;
							referDoctor = [cfg.section, cfg.doctor]
								.filter((s) => s !== "")
								.join("、");
						},
					];
				}),
				destroy: () => m.$destroy(),
			},
		});
	}

	function doRecord() {
		const formData = composeFormData();
		const s = JSON.stringify(formData);
		navigator.clipboard.writeText(s);
		savedContent = content;
		alert("クリップボードにコピーしました。");
	}

	async function doLoad() {
		const formData = JSON.parse(await navigator.clipboard.readText());
		loadFormData(formData);
	}

	function onBeforeUnload(event: BeforeUnloadEvent): any {
		if (contentIsModified() && !confirm("continue?")) {
			event.preventDefault();
		}
	}
</script>

{#if isVisible}
	<!-- svelte-ignore a11y-invalid-attribute -->
	<div class="wrapper">
		<div>
			<ServiceHeader title="紹介状" />
			<div style="margin: 10px 0;">
				{#if $patient === undefined}
					<button on:click={doSelectPatient}>患者選択</button>
				{:else}
					<button on:click={doClearPatient}>患者終了</button>
				{/if}
				<a
					href="javascript:void(0)"
					style="margin-left:2em;"
					on:click={doConfig}>Config</a
				>
				{#if $patient}
					<div style="margin-top: 4px;">
						({$patient.patientId}) {$patient.lastName}
						{$patient.firstName}
					</div>
				{/if}
			</div>
			<div style="display:grid; grid-template-columns:auto 1fr;gap: 4px;">
				<span>表題：</span>
				<input type="text" bind:value={title} style="width: 6em;" />
				<span>医療機関</span>
				<div style="display:flex;items-align:center;">
					<input type="text" bind:value={referHospital} style="width: 16em;" />
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<a
						style="margin-left:4px;cursor:pointer;"
						on:click={doConfigPopup}
						href="javascript:void(0)"
					>
						<ChevronDown />
					</a>
				</div>
				<span>医師</span>
				<div>
					<input type="text" bind:value={referDoctor} style="width: 16em;" /> 先生御机下
				</div>
				<span>患者氏名</span>
				<input type="text" bind:value={patientName} style="width: 16em;" />
				<span>患者情報</span>
				<input type="text" bind:value={patientInfo} style="width: 16em;" />
				<span>診断</span>
				<input type="text" bind:value={diagnosis} style="width: 16em;" />
				<span>内容</span>
				<textarea bind:value={content} style="width: 26em;height: 10em;" />
				<span>発行日</span>
				<input type="text" bind:value={issueDate} style="width: 16em;" />
				<span>住所</span>
				<textarea
					bind:value={address}
					style="width: 18em;height:5.5em;resize:vertical"
				/>
				<span>発行機関</span>
				<input type="text" bind:value={clinicName} style="width: 16em;" />
				<span>発行医師</span>
				<input type="text" bind:value={issuerDoctorName} style="width: 16em;" />
			</div>
			<div style="margin-top:10px;">
				<button on:click={doView}>表示</button>
				<button on:click={doRecord}>クリップボードへコピー</button>
				<button on:click={doLoad}>クリップボードからペースト</button>
			</div>
		</div>
		<div class="visit-view">
			<VisitsView {patient} />
		</div>
	</div>
{/if}
<svelte:window on:beforeunload={(evt) => onBeforeUnload(evt)} />

<style>
	.wrapper {
		display: grid;
		grid-template-columns: 1fr 400px;
		column-gap: 10px;
	}
</style>
