<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import { Shahokokuho, type Koukikourei, Patient } from "myclinic-model";
  import ShahokokuhoForm from "./edit/ShahokokuhoForm.svelte";
  import api from "@/lib/api";
  import * as kanjidate from "kanjidate";

  export let destroy: () => void;
  export let hoken1: Shahokokuho | Koukikourei;
  export let hoken2: Shahokokuho | Koukikourei;
  export let patient: Patient;
  let hoken1Usage: number = 0;
  let hoken2Usage: number = 0;
  let hoken1LastDate: string | undefined = undefined;
  let hoken2LastDate: string | undefined = undefined;

  init();

  async function init() {
    [hoken1Usage, hoken2Usage] = await countUsage();
  }

  async function countUsage(): Promise<[number, number]> {
    const shahokokuhoIds: number[] = [];
    const koukikoureiIds: number[] = [];
    if( hoken1 instanceof Shahokokuho ){
      shahokokuhoIds.push(hoken1.shahokokuhoId);
    } else {
      koukikoureiIds.push(hoken1.koukikoureiId);
    }
    if( hoken2 instanceof Shahokokuho ){
      shahokokuhoIds.push(hoken2.shahokokuhoId);
    } else {
      koukikoureiIds.push(hoken2.koukikoureiId);
    }
    const [shahokokuhoUsages, koukikoureiUsages, _r, _k] = await api.batchCountHokenUsage(
      shahokokuhoIds, koukikoureiIds, [], []
    );
    const pair: [number, number] = [0, 0];
    if( hoken1 instanceof Shahokokuho ){
      pair[0] = shahokokuhoUsages[hoken1.shahokokuhoId];
    } else {
      pair[0] = koukikoureiUsages[hoken1.koukikoureiId];
    }
    if( hoken2 instanceof Shahokokuho ){
      pair[1] = shahokokuhoUsages[hoken2.shahokokuhoId];
    } else {
      pair[1] = koukikoureiUsages[hoken2.koukikoureiId];
    }
    return pair;
  }

  function formatDate(d: string): string {
    return kanjidate.format(kanjidate.f2, d);
  }

  function doClose(): void {
    destroy();
  }
</script>

<Dialog title="保険修正編集" destroy={doClose}>
  <div class="form form1">
    {#if hoken1 instanceof Shahokokuho}
      <ShahokokuhoForm {patient} init={hoken1} >

      </ShahokokuhoForm>
    {/if}
    <div>
      使用回数：{hoken1Usage}回
      {#if hoken1LastDate}
        最終試用日：{formatDate(hoken1LastDate)}
      {/if}
    </div>
  </div>
  <div class="form form2">
    {#if hoken2 instanceof Shahokokuho}
      <ShahokokuhoForm {patient} init={hoken2} >

      </ShahokokuhoForm>
    {/if}
    <div>
      使用回数：{hoken2Usage}回
      {#if hoken2LastDate}
        最終試用日：{formatDate(hoken2LastDate)}
      {/if}
    </div>
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
</style>
