<script lang="ts">
  import api from "@/lib/api";
  import { confirm } from "@/lib/confirm-call";
  import DateFormWithCalendar from "@/lib/date-form/DateFormWithCalendar.svelte";
  import { genid } from "@/lib/genid";
  import { errorMessagesOf, isNotNull, validResult, type VResult } from "@/lib/validation";
  // import type { Invalid } from "@/lib/validator";
  import { validateDisease } from "@/lib/validators/disease-validator";
  import {
    ByoumeiMaster,
    Disease,
    DiseaseEndReason,
    DiseaseExample,
    diseaseFullName,
    ShuushokugoMaster,
    type DiseaseData,
  } from "myclinic-model";
  import { foldSearchResult } from "../fold-search-result";
  import DiseaseSearchForm from "../search/DiseaseSearchForm.svelte";
  import type { EditFormValues } from "./edit-form-values";

  export let formValues: EditFormValues;
  export let examples: DiseaseExample[];
  export let onEnter: (entered: DiseaseData) => void;
  export let onDelete: (diseaseId: number) => void;
  export let onCancel: () => void;
  let validateStartDate: () => VResult<Date | null>;
  let validateEndDate: () => VResult<Date | null>;
  let errors: string[] = [];

  let fullName: string = "";
  $: fullName = diseaseFullName(
    formValues.byoumeiMaster,
    formValues.shuushokugoMasters
  );
  const gengouList = ["平成", "令和"];

  function clearErrors(): void {
    errors = [];
  }

  async function doEnter() {
    clearErrors();
    const r: VResult<Disease> = validateDisease({
      diseaseId: validResult(formValues.diseaseId),
      patientId: validResult(formValues.patientId),
      shoubyoumeicode: validResult<ByoumeiMaster | undefined>(
        formValues.byoumeiMaster
      )
        .validate(isNotNull())
        .map((m) => m.shoubyoumeicode),
      startDate: validateStartDate(),
      endDate: validateEndDate(),
      endReason: validResult(formValues.endReason).map((r) => r.code),
    });
    if (r.isValid) {
      const ok = await api.updateDiseaseEx(
        r.value,
        formValues.shuushokugoMasters.map((m) => m.shuushokugocode)
      );
      if( !ok ){
        errors = ["症病名の更新に失敗しました。"];
        return;
      }
      const entered = await api.getDiseaseEx(formValues.diseaseId);
      onEnter(entered);
    } else {
      errors = errorMessagesOf(r.errors);
    }
  }

  function doSusp() {
    const c = formValues;
    c.shuushokugoMasters.push(ShuushokugoMaster.suspMaster);
    formValues = c;
  }

  function doDelAdj() {
    const c = formValues;
    c.shuushokugoMasters = [];
    formValues = c;
  }

  function doSearchSelect(
    r: DiseaseExample | ByoumeiMaster | ShuushokugoMaster
  ) {
    foldSearchResult(
      r,
      formValues.startDate ?? new Date(),
      (m: ByoumeiMaster) => {
        const c = formValues;
        c.byoumeiMaster = m;
        formValues = c;
      },
      (a: ShuushokugoMaster) => {
        const c = formValues;
        c.shuushokugoMasters.push(a);
        formValues = c;
      },
      (m: ByoumeiMaster | null, as: ShuushokugoMaster[]) => {
        const c = formValues;
        if (m != null) {
          c.byoumeiMaster = m;
        }
        c.shuushokugoMasters.push(...as);
        formValues = c;
      }
    );
  }

  function doDelete() {
    confirm("この病名を削除していいですか？", async () => {
      await api.deleteDiseaseEx(formValues.diseaseId);
      onDelete(formValues.diseaseId);
    });
  }
</script>

<div data-cy="disease-edit-form">
  {#if errors.length > 0}
    <div class="errors">
      {#each errors as err}
        <div>{err}</div>
      {/each}
    </div>
  {/if}
  <div>名前：<span data-cy="disease-name">{fullName}</span></div>
  <div class="date-wrapper start-date" data-cy="start-date-input">
    <DateFormWithCalendar init={formValues.startDate} {gengouList} bind:validate={validateStartDate}/>
  </div>
  <div class="date-wrapper end-date" data-cy="end-date-input">
    <DateFormWithCalendar init={formValues.endDate} {gengouList} bind:validate={validateEndDate}/>
  </div>
  <div class="end-reason">
    {#each Object.values(DiseaseEndReason) as reason}
      {@const id = genid()}
      <input
        type="radio"
        bind:group={formValues.endReason}
        value={reason}
        {id}
        data-cy="end-reason-input"
        data-reason-code={reason.code}
      />
      <label for={id}>{reason.label}</label>
    {/each}
  </div>
  <div>
    <button on:click={doEnter}>入力</button>
    <a href="javascript:void(0)" on:click={doSusp} data-cy="susp-link">の疑い</a
    >
    <a href="javascript:void(0)" on:click={doDelAdj} data-cy="delete-adj-link"
      >修飾語削除</a
    >
    <a href="javascript:void(0)" on:click={doDelete} data-cy="delete-link"
      >削除</a
    >
    <a href="javascript:void(0)" on:click={onCancel} data-cy="cancel-link"
      >キャンセル</a
    >
  </div>
  <DiseaseSearchForm
    {examples}
    startDate={formValues.startDate ?? new Date()}
    onSelect={doSearchSelect}
  />
</div>

<style>
  .errors {
    margin: 10px 0;
    color: red;
  }
  .date-wrapper {
    font-size: 13px;
    margin-top: 4px;
  }

  .date-wrapper :global(.calendar-icon) {
    margin-left: 6px;
    font-size: 16px;
    position: relative;
    top: 1px;
  }

  .end-reason {
    font-size: 13px;
  }
</style>
