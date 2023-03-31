<script lang="ts">
  import api from "@/lib/api";
  // import { checkKoukikoureiOnshiCompat, checkShahokokuhoOnshiCompat } from "@/lib/check-hoken-onshi-compat";
  import Dialog from "@/lib/Dialog.svelte";
  import { koukikoureiOnshiConsistent, shahokokuhoOnshiConsistent } from "@/lib/hoken-onshi-consistent";
  import { onshiConfirm } from "@/lib/onshi-confirm";
  import { onshi_query_from_hoken } from "@/lib/onshi-query-helper";
  import type { AppointTimeData } from "./appoint-time-data";
  import { Confirm } from "./onshi-confirm-for-date";

  export let destroy: () => void;
  export let date: string;
  export let siblings: AppointTimeData[];
  let destroyed: boolean = false;
  let confirms: Confirm[] = [];

  confirm();

  async function confirm() {
    for (let i = 0; i < siblings.length; i++) {
      if (destroyed) {
        return;
      }
      const d = siblings[i];
      d.appoints.forEach(async (appoint) => {
        const c: Confirm = new Confirm(
          appoint.appointId,
          appoint.patientName,
          ""
        );
        if (appoint.patientId > 0) {
          const patientId = appoint.patientId;
          const p = await api.getPatient(appoint.patientId);
          const shahoOpt = await api.findAvailableShahokokuho(patientId, date);
          const koukiOpt = await api.findAvailableKoukikourei(patientId, date);
          if (shahoOpt && koukiOpt) {
            c.message = "保険重複";
          } else if (shahoOpt) {
            c.message = "社保国保";
            const q = onshi_query_from_hoken(shahoOpt, p.birthday, date);
            const r = await onshiConfirm(q);
            if (r.isValid && r.resultList.length === 1) {
              const o = r.resultList[0];
              const err = shahokokuhoOnshiConsistent(shahoOpt, o);
              if (err) {
                c.message += "、" + err;
              } else {
                c.message += "、確認成功";
              }
            } else {
              c.message += "、確認失敗";
            }
          } else if (koukiOpt) {
            c.message = "後期高齢";
            const q = onshi_query_from_hoken(koukiOpt, p.birthday, date);
            const r = await onshiConfirm(q);
            if (r.isValid && r.resultList.length === 1) {
              const o = r.resultList[0];
              const err = koukikoureiOnshiConsistent(koukiOpt, o);
              if (err) {
                c.message += "、" + err;
              } else {
                c.message += "、確認成功";
              }
            } else {
              c.message += "、確認失敗";
            }
          } else {
            c.message = "保険なし";
          }
        } else {
          c.message = "患者番号なし";
        }
        confirms.push(c);
        confirms = confirms;
      });
    }
  }

  function doClose() {
    destroy();
  }
</script>

<Dialog destroy={doClose} title="保険証資格確認">
  <div class="wrapper">
    {#each confirms as c (c.appointId)}
      <div>
        <div>{c.name}： {c.message}</div>
      </div>
    {/each}
  </div>
</Dialog>

<style>
  .wrapper {
    max-height: 400px;
    overflow-y: auto;
  }
</style>
