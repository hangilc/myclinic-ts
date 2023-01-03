<script type="ts">
  import ServiceHeader from "../../ServiceHeader.svelte";
  import SelectPatientMenu from "./SelectPatientMenu.svelte";
  import Pulldown from "../../lib/Pulldown.svelte";
  import SelectRegisteredPatientDialog from "./select-patient-dialogs/SelectRegisteredPatientDialog.svelte";
  import SelectPatientBySearch from "./select-patient-dialogs/SelectPatientBySearch.svelte";
  import RecentVisitsDialog from "./select-patient-dialogs/RecentVisitsDialog.svelte";
  import { startPatient, showPatientsByDate } from "./ExamVars";
  import SearchShohouSampleDialog from "./SearchShohouSampleDialog.svelte";
  import GlobalSearchDialog from "./GlobalSearchDialog.svelte";

  let selectPatientLink: HTMLAnchorElement;
  let selectPatientPulldown: Pulldown;

  function onSelectPatientClick() {
    selectPatientPulldown.open();
  }

  function updateSelectPatientDialog(sel: string): void {
    switch (sel) {
      case "registered": {
        const d: SelectRegisteredPatientDialog = new SelectRegisteredPatientDialog({
          target: document.body,
          props: {
            destroy: () => d.$destroy(),
            onEnter: startPatient,
          },
        });
        break;
      }
      case "search": {
        const d: SelectPatientBySearch = new SelectPatientBySearch({
          target: document.body,
          props: {
            destroy: () => d.$destroy(),
            onEnter: startPatient,
          },
        });
        break;
      }
      case "recent": {
        const d: RecentVisitsDialog = new RecentVisitsDialog({
          target: document.body,
          props: {
            destroy: () => d.$destroy(),
            onEnter: startPatient,
          },
        });
        break;
      }
      case "by-date": {
        showPatientsByDate.set(true);
        break;
      }
    }
  }

  function doSearchShohouSample(): void {
    const d: SearchShohouSampleDialog = new SearchShohouSampleDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy()
      }
    })
  }

  function doGlobalSearch(): void {
    const d: GlobalSearchDialog = new GlobalSearchDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy()
      }
    });
  }
</script>

<ServiceHeader title="診察">
  <svelte:fragment>
    <a
      href="javascript:void(0);"
      bind:this={selectPatientLink}
      on:click={onSelectPatientClick}>患者選択</a
    >
    <a href="javascript:void(0);" on:click={doSearchShohouSample}>登録薬剤</a>
    <a href="javascript:void(0);" on:click={doGlobalSearch}>全文検索</a>
  </svelte:fragment>
</ServiceHeader>

<Pulldown bind:this={selectPatientPulldown} anchor={selectPatientLink}>
  <SelectPatientMenu onSelect={updateSelectPatientDialog} />
</Pulldown>

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
