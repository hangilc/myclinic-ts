<script lang="ts">
  import ServiceHeader from "@/ServiceHeader.svelte";
  import api from "@/lib/api";
  import { pad } from "@/lib/pad";
  import { hasHokenOrKouhi, loadVisits } from "@/lib/rezept-adapter";
  import type { Patient, Visit, VisitEx } from "myclinic-model";
  import {
    checkForRcpt,
    type CheckErrorWithFixers,
    type CheckResult,
  } from "./rcpt-check/check";

  export let isVisible = false;
  let shinryouYearMonth: string = defaultShinryouYearMonth();
  let patientTotal = 0;
  let current = 0;
  let errors: { patient: Patient; checkErrors: CheckErrorWithFixers[] }[] = [];

  function defaultShinryouYearMonth(): string {
    let now = new Date();
    const d = now.getDate();
    if (d <= 10) {
      now.setMonth(now.getMonth() - 1);
    }
    const y = now.getFullYear();
    const m = pad(now.getMonth() + 1, 2, "0");
    return `${y}${m}`;
  }

  function getYear(): number {
    return parseInt(shinryouYearMonth.substring(0, 4));
  }

  function getMonth(): number {
    return parseInt(shinryouYearMonth.substring(4, 6));
  }

  async function doStart() {
    const year = getYear();
    const month = getMonth();
    const visitMap = await loadVisits(year, month);
    const visitsList: Visit[][] = [...visitMap.shaho, ...visitMap.kokuho];
    current = 0;
    patientTotal = visitsList.length;
    errors = [];
    // serial = 1;
    for (const visits of visitsList) {
      if (visits.length === 0) {
        continue;
      }
      current += 1;
      let patientVisits: VisitEx[] = await Promise.all(
        visits.map(async (visit) => await api.getVisitEx(visit.visitId)),
      );
      const errs = await checkForRcpt(patientVisits);
      if (errs !== "ok" && errs !== "no-visit") {
        console.log("errs", errs);
        errors = [
          ...errors,
          { patient: patientVisits[0].patient, checkErrors: errs },
        ];
      }
    }
  }

  async function recheck(patientId: number): Promise<CheckResult> {
    const visitIds = await api.listVisitIdByPatientAndMonth(
      patientId,
      getYear(),
      getMonth(),
    );
    let visits = await Promise.all(
      visitIds.map(async (visitId) => await api.getVisitEx(visitId)),
    );
    visits = visits.filter((visit) => hasHokenOrKouhi(visit.asVisit));
    return checkForRcpt(visits);
  }

  async function doFix(
    fix: (() => Promise<boolean>) | undefined,
    patientId: number,
  ) {
    if (!fix) {
      return;
    }
    const ok = await fix();
    if (ok) {
      const errs = await recheck(patientId);
      if (errs === "ok") {
        errors = errors.filter((e) => e.patient.patientId !== patientId);
      } else if (errs === "no-visit") {
        alert("No visits");
      } else {
        errors = errors.map((e) => {
          if (e.patient.patientId === patientId) {
            return { patient: e.patient, checkErrors: errs };
          } else {
            return e;
          }
        });
      }
    }
  }
</script>

<div style:display={isVisible ? "" : "none"} class="wrapper">
  <ServiceHeader title="レセプトチェック" />
  <div>
    診療年月：<input type="text" bind:value={shinryouYearMonth} />
  </div>
  <div>
    <button on:click={doStart}>スタート</button>
  </div>
  <div>
    {#if patientTotal > 0}
      {current} / {patientTotal}
    {/if}
  </div>
  <div>
    {#each errors as error (error.patient.patientId)}
      <div class="error-wrapper">
        <div>({error.patient.patientId}) {error.patient.fullName()}</div>
        {#each error.checkErrors as ce}
          <div class="error-code-wrapper">
            <div class="error-code">{ce.code}</div>
            {#each ce.fixers as fixer}
              <div class="fix-wrapper">
                → {fixer.hint}
                <button
                  on:click={() => doFix(fixer.fix, error.patient.patientId)}
                  >Fix</button
                >
              </div>
            {/each}
          </div>
        {/each}
      </div>
    {/each}
  </div>
</div>

<style>
  .wrapper > div {
    margin-bottom: 10px;
  }

  .error-wrapper {
    padding: 10px;
    border: 1px solid gray;
    border-radius: 3px;
    margin-bottom: 6px;
  }

  .error-code-wrapper + .error-code-wrapper {
    margin-top: 6px;
  }

  .fix-wrapper {
    margin-top: 2px;
  }

</style>
