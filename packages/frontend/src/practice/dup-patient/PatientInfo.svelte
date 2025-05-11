<script lang="ts">
  import type { PatientInfo } from "./dup-patient";

  export let info: PatientInfo;
  let patient = info.patient;
  let hokenInfo = info.hokenInfo;
  let appoints = info.appoints;
  let diseases = info.diseases;
  let visitIds = info.visitIds;

</script>

<div>
  <div>
	[{patient.patientId}] {patient.lastName} {patient.firstName}
	({patient.lastNameYomi} {patient.firstNameYomi})
	{patient.birthday}
  </div>
  {#if hokenInfo}
	<div>
	  社保国保：{hokenInfo.shahokokuho.length}、
	  後期高齢：{hokenInfo.koukikourei.length}、
	  老人：{hokenInfo.roujin.length}、
	  公費：{hokenInfo.kouhi.length}
	</div>
  {/if}
  {#if appoints !== undefined}
	<div>
	  予約：{appoints.length}
	</div>
  {/if}
  {#if diseases !== undefined}
	<div>
	  病名：{diseases.length}
	</div>
  {/if}
  {#if visitIds !== undefined}
	<div>
	  診察：{visitIds.length}
	</div>
  {/if}
</div>
