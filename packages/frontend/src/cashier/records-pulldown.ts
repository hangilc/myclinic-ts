import SearchPatientDialog from "@/lib/SearchPatientDialog.svelte";
import RecentVisitsDialog from "@/lib/RecentVisitsDialog.svelte";
import type { Patient, Visit } from "myclinic-model";
import { openRecords } from "./open-records";
import VisitsByDateDialog from "@/lib/VisitsByDateDialog.svelte";

export function doSearch(): void {
  const d: SearchPatientDialog = new SearchPatientDialog({
    target: document.body,
    props: {
      destroy: () => d.$destroy(),
      title: "診療録（患者検索）",
      onEnter: (p: Patient) => {
        openRecords(p);
      },
      onSingleResult: (p: Patient, destroy: () => void) => {
        destroy();
        openRecords(p);
      },
    },
  });
}

export function doRecentVisit(): void {
  const d: RecentVisitsDialog = new RecentVisitsDialog({
    target: document.body,
    props: {
      destroy: () => d.$destroy(),
      title: "診療録（最近の診察）",
      onEnter: (item: [Visit, Patient]) => {
        openRecords(item[1]);
      },
    },
  });
}

export function doByDate(): void {
  const d: VisitsByDateDialog = new VisitsByDateDialog({
    target: document.body,
    props: {
      destroy: () => d.$destroy(),
      title: "診療録（日付別）",
      onEnter: (_visit: Visit, patient: Patient) => {
        openRecords(patient);
      },
    },
  });
}

// <div class="top">
//   <a href="javascript:void(0)" on:click={doSearch}>患者検索</a>
//   <a href="javascript:void(0)" on:click={doRecentVisit}>最近の診察</a>
//   <a href="javascript:void(0)" on:click={doByDate}>日付別</a>
// </div>

// <style>
//   a {
//     display: block;
//     margin-bottom: 4px;
//   }

//   a:last-of-type {
//     margin-bottom: 0;
//   }
// </style>
