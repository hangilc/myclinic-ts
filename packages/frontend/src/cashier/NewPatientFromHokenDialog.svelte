<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import api from "@/lib/api";
  import DateFormWithCalendar from "@/lib/date-form/DateFormWithCalendar.svelte";
  import { onshiConfirm, type OnshiKakuninQuery } from "@/lib/onshi-confirm";
  import { onshiToPatient } from "@/lib/onshi-patient";
  import { type VResult } from "@/lib/validation";
  import { hotlineTrigger } from "@/lib/event-emitter";
  import { Koukikourei, Patient, Shahokokuho, dateToSqlDate } from "myclinic-model";
  import { PatientData } from "./patient-dialog/patient-data";
  import { createHokenFromOnshiResult } from "@/lib/onshi-hoken";

  export let destroy: () => void;
  let mode: "shahokokuho" | "koukikourei" = "shahokokuho";
  let validateBirthdate: (() => VResult<Date | null>) | undefined = undefined;
  let error: string = "";
  let hokensha = "";
  let hihokensha = "";
  let hihokenshaKigou = "";
  let edaban = "";
  let phone = "";

  function doClose(): void {
    destroy();
  }

  function validate(): OnshiKakuninQuery | string {
    if( !validateBirthdate ){
      throw new Error("uninitialized validator");
    }
    hokensha = hokensha.trim();
    if( !hokensha ){
      return "保険者番号が入力されていません。";
    }
    hihokensha = hihokensha.trim();
    if( !hihokensha ){
      return "被保険者番号が入力されていません。";
    }
    const validatedBirthdate = validateBirthdate();
    if( validatedBirthdate.isError ){
      return validatedBirthdate.errorMessages.join("\n");
    }
    const birthdate = validatedBirthdate.value;
    if( !birthdate ){
      return "生年月日が入力されていません。";
    }
    phone = phone.trim();
    console.log("phone", phone);
    if( !phone ){
      return "電話番号が入力されていません。";
    }
    return {
      hokensha,
      hihokensha,
      birthdate: dateToSqlDate(birthdate),
      confirmationDate: dateToSqlDate(new Date()),
      kigou: hihokenshaKigou === "" ? undefined : hihokenshaKigou,
      edaban: edaban === "" ? undefined : edaban,
      limitAppConsFlag: "1",
    }
  }

  async function doEnter() {
    const validated = validate();
    if( typeof validated === "string" ){
      error = validated;
      return;
    }
    const confirm = await onshiConfirm(validated);
    const patient = onshiToPatient(confirm);
    patient.phone = phone;
    const entered: Patient = await api.enterPatient(patient);
    const hoken = createHokenFromOnshiResult(entered.patientId, confirm.resultList[0]);
    if( typeof hoken === "string" ){
      error = hoken;
      return;
    }
    if( hoken instanceof Shahokokuho ){
      await api.enterShahokokuho(hoken);
    } else if( hoken instanceof Koukikourei ){
      await api.enterKoukikourei(hoken);
    }
    doClose();
    PatientData.start(entered, { hotlineTrigger: hotlineTrigger})
  }
</script>

<Dialog title="保険証から患者登録" destroy={doClose}>
  <div>
    <input
      type="radio"
      name="mode"
      bind:group={mode}
      value="shahokokuho"
    />社保国保
    <input
      type="radio"
      name="mode"
      bind:group={mode}
      value="koukikourei"
    />後期高齢
  </div>
  {#if error !== ""}
    <div class="error">{error}</div>
  {/if}
  <div>
    <div class="input-row">
      <span class="input-key">生年月日：</span>
      <div class="input-block birthday-input" data-cy="birthday-input-wrapper">
        <DateFormWithCalendar init={null} bind:validate={validateBirthdate}/>
      </div>
    </div>
    <div class="input-row">
      <span class="input-key">保険者番号：</span><input type="text" bind:value={hokensha}/>
    </div>
  </div>
  {#if mode === "shahokokuho"}
    <div class="input-row">
      <span class="input-key">被保険者記号：</span><input type="text" bind:value={hihokenshaKigou}/>
    </div>
    <div class="input-row">
      <span class="input-key">被保険者番号：</span><input type="text" bind:value={hihokensha}/>
    </div>
    <div class="input-row">
      <span class="input-key">枝番：</span><input type="text" bind:value={edaban}/>
    </div>
  {:else}
    <div class="input-row">
      <span class="input-key">被保険者番号：</span><input type="text" bind:value={hihokensha}/>
    </div>
  {/if}
  <hr />
  <div>
    電話番号：<input type="text" bind:value={phone} />
  </div>
  <div class="commands">
    <button on:click={doEnter}>入力</button>
    <button on:click={doClose}>キャンセル</button>
  </div>
</Dialog>

<style>
  .input-row {
    margin: 6px 0;
  }

  .input-key {
    display: inline-block;
    width: 12ch;
    text-align: right;
  }

  .input-block {
    display: inline-block;
  }

  .error {
    padding: 10px;
    color: red;
    border: 1px solid red;
    margin: 10px 0;
  }

  .commands {
    display: flex;
    justify-content: right;
    margin-top: 10px;
  }
  .commands * + * {
    margin-left: 4px;
  }
</style>
