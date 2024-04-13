<script lang="ts">
  import api from "@/lib/api";
  import Dialog from "@/lib/Dialog.svelte";
  import { type Patient, Kouhi, fromMemoStore } from "myclinic-model";
  import { gengouListUpto } from "@/lib/gengou-list-upto";
  import DateInput from "@/lib/date-input/DateInput.svelte";
  import { toKouhi, toSafeConvert, type DateInputInterface } from "myclinic-model";

  export let destroy: () => void;
  export let title: string;
  export let init: Kouhi | null;
  export let patient: Patient;
  export let onEntered: (entered: Kouhi) => void = (_) => {};
  export let onUpdated: (entered: Kouhi) => void = (_) => {};
  export let isAdmin: boolean;
  let getValidFromInputs: () => DateInputInterface;
  let getValidUptoInputs: () => DateInputInterface;
  let futansha: string = init?.futansha.toString() ?? "";
  let jukyuusha: string = init?.jukyuusha.toString() ?? "";
  let memo: any = (init ? fromMemoStore(init.memo) : {}) ?? {};
  let gendogaku: string = memo.gendogaku ?? "";
  let gengouList = gengouListUpto("平成");
  let errors: string[] = [];

  // async function doEnter(kouhi: Kouhi): Promise<string[]> {
  //   if (init === null) {
  //     kouhi.kouhiId = 0;
  //   }
  //   try {
  //     if (init === null) {
  //       const entered = await api.enterKouhi(kouhi);
  //       onEntered(entered);
  //       return [];
  //     } else {
  //       if (kouhi.kouhiId <= 0) {
  //         return ["Invalid kouhiId"];
  //       } else {
  //         if (!isAdmin) {
  //           const usage = await api.countKouhiUsage(kouhi.kouhiId);
  //           if (usage > 0) {
  //             return [
  //               "この公費はすでに使用されているので、内容を変更できません。",
  //             ];
  //           }
  //         }
  //         await api.updateKouhi(kouhi);
  //         onUpdated(kouhi);
  //         return [];
  //       }
  //     }
  //   } catch (ex: any) {
  //     return [ex.toString()];
  //   }
  // }

  async function doEnter() {
    const kouhiId = init?.kouhiId ?? 0;
    const input = {
      kouhiId: init?.kouhiId ?? 0,
      futansha,
      jukyuusha,
      validFrom: getValidFromInputs(),
      validUpto: getValidUptoInputs(),
      patientId: patient.patientId,
      memo: "",
    };
    const r = toSafeConvert(toKouhi)(input);
    if( r.isError() ){
      errors = r.getErrorMessages();
    } else {
      const kouhi = r.getValue();
      if( init == null ){
        const entered = await api.enterKouhi(kouhi);
        onEntered(entered);
        destroy();
      }
    }
  }

  function doClose() {
    destroy();
  }

  async function doReferAnother() {

  }
</script>

<Dialog {destroy} {title}>
  {#if errors.length > 0}
    <div class="error">{#each errors as err}<div>{err}</div>{/each}</div>
  {/if}
  <div>
    <span data-cy="patient-id">({patient.patientId})</span>
    <span data-cy="patient-name">{patient.fullName(" ")}</span>
  </div>
  <div class="panel">
    <span>負担者番号</span>
    <div>
      <input
        type="text"
        class="regular"
        bind:value={futansha}
        data-cy="futansha-input"
      />
    </div>
    <span>受給者番号</span>
    <div>
      <input
        type="text"
        class="regular"
        bind:value={jukyuusha}
        data-cy="jukyuusha-input"
      />
    </div>
    {#if init?.futansha === 54136015}
      <span>限度額</span>
      <div>
        <input
          type="text"
          class="regular"
          bind:value={gendogaku}
          data-cy="gendogaku-input"
        />
      </div>
    {/if}
    <span>期限開始</span>
    <div data-cy="valid-from-input">
      <DateInput bind:getInputs={getValidFromInputs} initValue={init?.validFrom} {gengouList}/>
    </div>
    <span>期限終了</span>
    <div data-cy="valid-upto-input">
      <DateInput bind:getInputs={getValidUptoInputs} initValue={init?.validUpto} {gengouList}/>
    </div>
  </div>
  <div class="commands">
    <a href="javascript:void(0)" on:click={doReferAnother}>別保険参照</a>
    <button on:click={doEnter}>入力</button>
    <button on:click={doClose}>キャンセル</button>
  </div>
</Dialog>

<style>
  .panel {
    display: grid;
    grid-template-columns: auto 1fr;
    row-gap: 6px;
    column-gap: 6px;
    width: 340px;
  }

  .panel > :nth-child(odd) {
    text-align: right;
  }

  input[type="text"].regular {
    width: 6rem;
  }
  .form-wrapper {
    display: flex;
    gap: 10px;
  }
  .error {
    margin: 10px 0;
    color: red;
  }
  .commands {
    display: flex;
    justify-content: right;
    align-items: center;
    margin-top: 10px;
  }

  .commands * + * {
    margin-left: 4px;
  }

  .error {
    color: red;
    margin: 10px 0;
  }
</style>
