<script type="ts">
  import ServiceHeader from "../../ServiceHeader.svelte";
  import SelectPatientMenu from "./SelectPatientMenu.svelte";
  import Pulldown from "../../lib/Pulldown.svelte";
  import SelectRegisteredPatientDialog from "./select-patient-dialogs/SelectRegisteredPatientDialog.svelte";
  import SelectPatientBySearch from "./select-patient-dialogs/SelectPatientBySearch.svelte";
  import RecentVisitsDialog from "./select-patient-dialogs/RecentVisitsDialog.svelte";
  import { startPatient, showPatientsByDate } from "./ExamVars";
    import SearchShohouSampleDialog from "./SearchShohouSampleDialog.svelte";

  let selectPatientLink: HTMLAnchorElement;
  let registeredDialog: SelectRegisteredPatientDialog;
  let searchDialog: SelectPatientBySearch;
  let recentDialog: RecentVisitsDialog;
  let selectPatientPulldown: Pulldown;
  let searchShohouSampleDialog: SearchShohouSampleDialog;

  function onSelectPatientClick() {
    selectPatientPulldown.open();
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

  function doSearchShohouSample(): void {
    searchShohouSampleDialog.open();
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
    <a href="javascript:void(0);" on:click={doSearchShohouSample}>登録薬剤</a>
    <a href="javascript:void(0);">全文検索</a>
    <SelectRegisteredPatientDialog
      bind:this={registeredDialog}
      onEnter={startPatient}
    />
    <SelectPatientBySearch
      bind:this={searchDialog}
      onEnter={startPatient}
    />
    <RecentVisitsDialog
      bind:this={recentDialog}
      onEnter={startPatient}
    />
    
  </svelte:fragment>
</ServiceHeader>

<Pulldown bind:this={selectPatientPulldown} anchor={selectPatientLink} >
  <SelectPatientMenu onSelect={updateSelectPatientDialog}/>
</Pulldown>
<SearchShohouSampleDialog bind:this={searchShohouSampleDialog} />

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
