<script lang="ts">
  import ServiceHeader from "../../ServiceHeader.svelte";
  import SelectRegisteredPatientDialog from "./select-patient-dialogs/SelectRegisteredPatientDialog.svelte";
  import SelectPatientBySearch from "./select-patient-dialogs/SelectPatientBySearch.svelte";
  import RecentVisitsDialog from "./select-patient-dialogs/RecentVisitsDialog.svelte";
  import { startPatient, showPatientsByDate, showAppoints } from "./exam-vars";
  import SearchShohouSampleDialog from "./SearchShohouSampleDialog.svelte";
  import GlobalSearchDialog from "./GlobalSearchDialog.svelte";
  import OnshiKakuninFormDialog from "@/lib/OnshiKakuninFormDialog.svelte";
  import PopupMenu from "@/lib/PopupMenu.svelte";
  import { dataCySetter } from "@/lib/popup-helper";
  import * as cache from "@/lib/cache";
  import { searchPrescribed } from "@/lib/denshi-shohou/presc-api";

  function updateSelectPatientDialog(sel: string): void {
    switch (sel) {
      case "registered": {
        const d: SelectRegisteredPatientDialog =
          new SelectRegisteredPatientDialog({
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
      case "appoint": {
        showAppoints.set(true);
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
        destroy: () => d.$destroy(),
      },
    });
  }

  function doGlobalSearch(): void {
    const d: GlobalSearchDialog = new GlobalSearchDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
      },
    });
  }

  function doOnshiConfirmForm() {
    const d: OnshiKakuninFormDialog = new OnshiKakuninFormDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
      },
    });
  }

  function doSelectPatientPopup(evt: MouseEvent) {
    const m: PopupMenu = new PopupMenu({
      target: document.body,
      props: {
        event: evt,
        menu: [
          ["受付患者選択", () => updateSelectPatientDialog("registered")],
          ["患者検索", () => updateSelectPatientDialog("search"), dataCySetter("select-patient-menu")],
          ["最近の診察", () => updateSelectPatientDialog("recent")],
          ["予約患者", () => updateSelectPatientDialog("appoint")],
          ["日付別", () => updateSelectPatientDialog("by-date")],
        ],
        destroy: () => m.$destroy(),
      },
    });
  }


  async function doSearchPresc() {
    const kikancode = await cache.getShohouKikancode();
    let startDate = "20240801000000";
    let endDate = "20240818000000";
    const result = await searchPrescribed(kikancode, startDate, endDate);
    console.log("result", result);
  }
</script>

<ServiceHeader title="診察">
  <svelte:fragment>
    <a href="javascript:void(0);" on:click={doSelectPatientPopup} data-cy="select-patient-menu">患者選択</a>
    <a href="javascript:void(0);" on:click={doSearchShohouSample}>登録薬剤</a>
    <a href="javascript:void(0);" on:click={doGlobalSearch}>全文検索</a>
    <a href="javascript:void(0);" on:click={doOnshiConfirmForm}>資格確認</a>
    <a href="javascript:void(0);" on:click={doSearchPresc}>処方検索</a>
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
