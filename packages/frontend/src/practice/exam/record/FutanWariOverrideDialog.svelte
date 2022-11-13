<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte"
  import { tick } from "svelte"
  import {
    VisitObject, type VisitAttributes, type VisitEx, VisitExObject
  } from "@/lib/model"
  import api from "@/lib/api"

  export let visit: VisitEx;
  let futanWariDialog: Dialog;
  let currentRep: string;
  let input: HTMLInputElement;
  let error: string = "";

  $: currentRep = futanWariRep(visit);

  export function open(): void {
    futanWariDialog.open();
  }

  function futanWariRep(visit: VisitEx): string {
    const futanWari = VisitExObject.attributesOf(visit)?.futanWari;
    if( futanWari == null ){
      return "（未設定）";
    } else {
      return `${futanWari}割`;
    }
  }

  function setFutanWariInput(e: HTMLInputElement): void {
    input = e;
  }

  function setFocus(e: HTMLInputElement): void {
    tick().then(_ => {
      e.focus();
    });
  }

  function onFutanWariEnter(close: () => void): void {
    const value: string = input.value;
    const oldAttr: VisitAttributes | null = VisitExObject.attributesOf(visit);
    let newFutanWari: number | null;
    if( value === "" ){
      newFutanWari = null;
    } else {
      try {
        newFutanWari = parseInt(value);
      } catch(ex) {
        error = "空白か非負の整数の入力が必要です。"
        return;
      }
    }
    let newAttr: VisitAttributes | null;
    if( newFutanWari == null ){
      newAttr = Object.assign({}, oldAttr);
      delete newAttr.futanWari;
    } else {
      newAttr = Object.assign({}, oldAttr, { futanWari: newFutanWari });
    }
    const newVisit = VisitObject.updateAttribute(VisitExObject.asVisit(visit), newAttr);
    api.updateVisit(newVisit);
    close();
  }

</script>

<Dialog let:close={close} bind:this={futanWariDialog}>
  <span slot="title">負担割オーバーライド</span>
  <div>現在の設定：{currentRep}</div>
  {#if error !== "" }
  <div class="error">{error}</div>
  {/if}
  <div class="futanwari-form">
    <input type="text" use:setFutanWariInput use:setFocus/><span>割</span>
  </div>
  <svelte:fragment slot="commands">
    <button on:click={() => onFutanWariEnter(close)}>入力</button>
    <button on:click={close}>キャンセル</button>
  </svelte:fragment>
</Dialog>

<style>
  .error {
    color: red;
  }

  .futanwari-form {
    display: flex;
    align-items: center;
  }

  .futanwari-form :global(input) {
    width: 3em;
  }

  .futanwari-form :global(span) {
    display: inline-block;
    margin-left: 4px;
  }
</style>
