<script type="ts">
  import ServiceHeader from "../../ServiceHeader.svelte";
  import type * as m from "../../lib/model";
  import SelectPatientMenu from "./SelectPatientMenu.svelte";
  import Pulldown from "../../lib/Pulldown.svelte";
  import SelectRegisteredPatientDialog from "./select-patient-dialogs/SelectRegisteredPatientDialog.svelte";
  import SelectPatientBySearch from "./select-patient-dialogs/SelectPatientBySearch.svelte";
  import RecentVisitsDialog from "./select-patient-dialogs/RecentVisitsDialog.svelte";
  import { reqChangePatient, showPatientsByDate } from "./ExamVars";

  let selectPatientLink;
  let selectPatientVisible = false;
  let selectPatientDialog: string | null = null;
  let registeredDialog: SelectRegisteredPatientDialog;
  let searchDialog: SelectPatientBySearch;
  let recentDialog: RecentVisitsDialog;

  function onSelectPatientClick() {
    selectPatientVisible = true;
  }

  function startPatient(patient: m.Patient, visitId: number | null){
    console.log("start-patient", patient, visitId);
    reqChangePatient.set([patient, visitId]);
  }

  function updateSelectPatientDialog(sel: string): void {
    switch(sel){
      case "registered": {
        registeredDialog.open();
        break;
      }
      case "search": {
        searchDialog.open();
        break;
      }
      case "recent": {
        recentDialog.open();
        break;
      }
      case "by-date": {
        showPatientsByDate.set(true);
        break;
      }
    }
  }

</script>

<!-- svelte-ignore a11y-invalid-attribute -->
<ServiceHeader title="診察">
  <svelte:fragment>
    <a
      href="javascript:void(0);"
      bind:this={selectPatientLink}
      on:click={onSelectPatientClick}>患者選択</a
    >
    <a href="javascript:void(0);">登録薬剤</a>
    <a href="javascript:void(0);">全文検索</a>
    {#if selectPatientVisible}
      <Pulldown
        onClose={() => {selectPatientVisible = false}}
        anchor={selectPatientLink}
      >
        <SelectPatientMenu onSelect={updateSelectPatientDialog}/>
      </Pulldown>
    {/if}
    <SelectRegisteredPatientDialog
      bind:this={registeredDialog}
      onEnter={startPatient}
    />
    {#if true}
    <SelectPatientBySearch
      bind:this={searchDialog}
      onEnter={startPatient}
    />
    {/if}
    <RecentVisitsDialog
      bind:this={recentDialog}
      onEnter={startPatient}
    />
    
  </svelte:fragment>
</ServiceHeader>

<style>
  a:nth-of-type(1) {
    margin-left: 100px;
  }
  a:nth-of-type(2) {
    margin-left: 20px;
  }
  a {
    margin-left: 6px;
  }
</style>
