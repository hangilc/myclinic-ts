<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import { Shahokokuho, Koukikourei, Patient, Visit } from "myclinic-model";
  import ShahokokuhoForm from "./edit/ShahokokuhoForm.svelte";
  import api from "@/lib/api";
  import * as kanjidate from "kanjidate";
  import KoukikoureiForm from "./edit/KoukikoureiForm.svelte";
  import type { VResult } from "@/lib/validation";
  import { shallowEqual } from "@/lib/shallow-equal";
  import { confirm } from "@/lib/confirm-call";

  export let destroy: () => void;
  export let hoken1: Shahokokuho | Koukikourei;
  export let hoken2: Shahokokuho | Koukikourei;
  export let patient: Patient;
  export let onHandle: (
    shahokokuhoList: Shahokokuho[],
    koukikoureiList: Koukikourei[]
  ) => void;
  export let onDelete: (deleted: Shahokokuho | Koukikourei) => void;
  let initDone: boolean = false;
  let hoken1Usage: Visit[] = [];
  let hoken2Usage: Visit[] = [];
  let validateShahokokuho1: (() => VResult<Shahokokuho>) | undefined =
    undefined;
  let validateShahokokuho2: (() => VResult<Shahokokuho>) | undefined =
    undefined;
  let validateKoukikourei1: (() => VResult<Koukikourei>) | undefined =
    undefined;
  let validateKoukikourei2: (() => VResult<Koukikourei>) | undefined =
    undefined;
  let form1Error: string = "";
  let form2Error: string = "";

  init();

  async function init() {
    hoken1Usage = await fetchUsage(hoken1);
    hoken2Usage = await fetchUsage(hoken2);
    initDone = true;
  }

  async function fetchUsage(h: Shahokokuho | Koukikourei): Promise<Visit[]> {
    if (h instanceof Shahokokuho) {
      return await api.shahokokuhoUsage(h.shahokokuhoId);
    } else {
      return await api.koukikoureiUsage(h.koukikoureiId);
    }
  }

  function formatDate(d: string): string {
    return kanjidate.format(kanjidate.f2, d);
  }

  function lastVisitDate(visits: Visit[]): string {
    if (visits.length > 0) {
      return formatDate(visits[visits.length - 1].visitedAt.substring(0, 10));
    } else {
      return "";
    }
  }

  function doClose(): void {
    destroy();
  }

  function deleteHoken(hoken: Shahokokuho | Koukikourei) {
    confirm("この保険を削除していいですか？", async () => {
      if (hoken instanceof Shahokokuho) {
        await api.deleteShahokokuho(hoken.shahokokuhoId);
      } else {
        await api.deleteKoukikourei(hoken.koukikoureiId);
      }
      onDelete(hoken);
    });
  }

  function doDeleteHoken1(): void {
    deleteHoken(hoken1);
  }

  function doDeleteHoken2(): void {
    deleteHoken(hoken2);
  }

  async function doEnter() {
    const shahokokuhoList: Shahokokuho[] = [];
    const koukikoureiList: Koukikourei[] = [];
    if (hoken1 instanceof Shahokokuho && validateShahokokuho1) {
      const r = validateShahokokuho1();
      if (r.isError) {
        form1Error = r.errorMessages.join("");
      } else {
        shahokokuhoList.push(r.value);
      }
    } else if (hoken1 instanceof Koukikourei && validateKoukikourei1) {
      const r = validateKoukikourei1();
      if (r.isError) {
        form1Error = r.errorMessages.join("");
      } else {
        koukikoureiList.push(r.value);
      }
    }
    if (hoken2 instanceof Shahokokuho && validateShahokokuho2) {
      const r = validateShahokokuho2();
      if (r.isError) {
        form2Error = r.errorMessages.join("");
      } else {
        shahokokuhoList.push(r.value);
      }
    } else if (hoken2 instanceof Koukikourei && validateKoukikourei2) {
      const r = validateKoukikourei2();
      if (r.isError) {
        form2Error = r.errorMessages.join("");
      } else {
        koukikoureiList.push(r.value);
      }
    }
    if (shahokokuhoList.length + koukikoureiList.length === 2) {
      const [s, k] = await api.batchEnterOrUpdateHoken(
        shahokokuhoList,
        koukikoureiList
      );
      onHandle(s, k);
    }
  }
</script>

<Dialog title="保険修正編集" destroy={doClose}>
  <div class="forms-wrapper">
    <div class="form form1">
      {#if form1Error !== ""}
        <div class="error">{form1Error}</div>
      {/if}
      {#if hoken1 instanceof Shahokokuho}
        <ShahokokuhoForm
          {patient}
          init={hoken1}
          bind:validate={validateShahokokuho1}
        />
      {:else}
        <KoukikoureiForm
          {patient}
          init={hoken1}
          bind:validate={validateKoukikourei1}
        />
      {/if}
      <div>
        使用回数：{hoken1Usage.length}回
        {#if hoken1Usage.length > 0}
          最終試用日：{lastVisitDate(hoken1Usage)}
        {:else}
          <button on:click={doDeleteHoken1}>削除</button>
        {/if}
      </div>
    </div>
    <div class="form form2">
      {#if form2Error !== ""}
        <div class="error">{form2Error}</div>
      {/if}
      {#if hoken2 instanceof Shahokokuho}
        <ShahokokuhoForm
          {patient}
          init={hoken2}
          bind:validate={validateShahokokuho2}
        />
      {:else}
        <KoukikoureiForm
          {patient}
          init={hoken2}
          bind:validate={validateKoukikourei2}
        />
      {/if}
      <div>
        使用回数：{hoken2Usage.length}回
        {#if hoken2Usage.length > 0}
          最終試用日：{lastVisitDate(hoken2Usage)}
        {:else}
          <button on:click={doDeleteHoken2}>削除</button>
        {/if}
      </div>
    </div>
  </div>
  <div class="commands">
    {#if shallowEqual( hoken1, hoken2, { excludeKeys: ["shahokokuhoId", "koukikoureiId"] } )}
      （両者同じ内容）
    {/if}
    <button on:click={doEnter}>入力</button>
    <button on:click={doClose}>キャンセル</button>
  </div>
</Dialog>

<style>
  .form {
    display: inline-block;
  }

  .form1 {
    padding-right: 10px;
    border-right: 1px solid black;
  }

  .form2 {
    padding-left: 10px;
  }

  .commands {
    display: flex;
    justify-content: right;
    align-items: center;
  }

  .commands * + * {
    margin-left: 4px;
  }

  .commands button:first-of-type {
    margin-left: 10px;
  }

  .error {
    color: red;
    margin: 10px 0;
  }
</style>
