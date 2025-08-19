<script lang="ts">
  import { kouhiRep } from "@/lib/hoken-rep";
  import { 負担区分レコードEdit, type 薬品情報Edit } from "../denshi-edit";
  import type { KouhiSet } from "../kouhi-set";
  export let kouhiSet: KouhiSet;
  export let drug: 薬品情報Edit;
  export let onCancel: () => void;
  export let onEnter: () => void;

  let kouhi1Value: "true" | "false" | "undefined" = encodeValue(
    drug.負担区分レコード?.第一公費負担区分,
  );
  let kouhi2Value: "true" | "false" | "undefined" = encodeValue(
    drug.負担区分レコード?.第二公費負担区分,
  );
  let kouhi3Value: "true" | "false" | "undefined" = encodeValue(
    drug.負担区分レコード?.第三公費負担区分,
  );
  let kouhiSpecialValue: "true" | "false" | "undefined" = encodeValue(
    drug.負担区分レコード?.特殊公費負担区分,
  );

  function encodeValue(orig: boolean | undefined): "true" | "false" | "undefined" {
    if (orig === undefined) {
      return "undefined";
    } else {
      return orig ? "true" : "false";
    }
  }

  function decodeValue(value: "true" | "false" | "undefined"): boolean | undefined {
    switch(value){
      case "true": return true;
      case "false": return false;
      case "undefined": return undefined;
    }
  }

  function doCancel() {
    onCancel();
  }

  function doEnter() {
    let r: 負担区分レコードEdit = 負担区分レコードEdit.fromObject({
      第一公費負担区分: decodeValue(kouhi1Value),
      第二公費負担区分: decodeValue(kouhi2Value),
      第三公費負担区分: decodeValue(kouhi3Value),
      特殊公費負担区分: decodeValue(kouhiSpecialValue),
    });
    drug.負担区分レコード = r;
    onEnter();
  }
</script>

<div class="form">
  {#if kouhiSet.kouhi1}
    {kouhiSet.kouhi1Label()}（{kouhiRep(kouhiSet.kouhi1.公費負担者番号)}）：
    <input type="radio" bind:group={kouhi1Value} value="undefined" />規定
    <input type="radio" bind:group={kouhi1Value} value="true" />適用
    <input type="radio" bind:group={kouhi1Value} value="false" />非適用
  {/if}
  {#if kouhiSet.kouhi2}
    第二公費（{kouhiRep(kouhiSet.kouhi2.公費負担者番号)}）：
    <input type="radio" bind:group={kouhi2Value} value="undefined" />規定
    <input type="radio" bind:group={kouhi2Value} value="true" />適用
    <input type="radio" bind:group={kouhi2Value} value="false" />非適用
  {/if}
  {#if kouhiSet.kouhi3}
    第三公費（{kouhiRep(kouhiSet.kouhi3.公費負担者番号)}）：
    <input type="radio" bind:group={kouhi3Value} value="undefined" />規定
    <input type="radio" bind:group={kouhi3Value} value="true" />適用
    <input type="radio" bind:group={kouhi3Value} value="false" />非適用
  {/if}
  {#if kouhiSet.kouhiSpecial}
    特殊公費（{kouhiRep(kouhiSet.kouhiSpecial.公費負担者番号)}）：
    <input type="radio" bind:group={kouhiSpecialValue} value="undefined" />規定
    <input type="radio" bind:group={kouhiSpecialValue} value="true" />適用
    <input type="radio" bind:group={kouhiSpecialValue} value="false" />非適用
  {/if}
  <div>
    <button on:click={doEnter}>決定</button>
    <button on:click={doCancel}>キャンセル</button>
  </div>
</div>

<style>
  .form {
    border: 1px solid gray;
    padding: 6px;
    user-select: none;
  }
</style>
