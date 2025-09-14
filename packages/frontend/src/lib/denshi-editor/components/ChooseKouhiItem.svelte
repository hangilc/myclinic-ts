<script lang="ts">
  import { kouhiRep } from "@/lib/hoken-rep";
  import { 負担区分レコードEdit, type 薬品情報Edit } from "../denshi-edit";
  import type { KouhiSet } from "../kouhi-set";
  import type { 薬品情報 } from "@/lib/denshi-shohou/presc-info";

  export let kouhiSet: KouhiSet;
  export let drug: 薬品情報Edit;

  let kouhi1Value: "true" | "false" | "undefined" = "undefined";
  let kouhi2Value: "true" | "false" | "undefined" = "undefined";
  let kouhi3Value: "true" | "false" | "undefined" = "undefined";
  let kouhiSpecialValue: "true" | "false" | "undefined" = "undefined";

  $: updateValues(drug)

  function updateValues(drug: 薬品情報) {
    kouhi1Value = encodeValue(drug.負担区分レコード?.第一公費負担区分);
    kouhi2Value = encodeValue(drug.負担区分レコード?.第二公費負担区分);
    kouhi3Value = encodeValue(drug.負担区分レコード?.第三公費負担区分);
    kouhiSpecialValue = encodeValue(drug.負担区分レコード?.特殊公費負担区分);
  }

  function encodeValue(
    orig: boolean | undefined,
  ): "true" | "false" | "undefined" {
    if (orig === undefined) {
      return "undefined";
    } else {
      return orig ? "true" : "false";
    }
  }

  function decodeValue(
    value: "true" | "false" | "undefined",
  ): boolean | undefined {
    switch (value) {
      case "true":
        return true;
      case "false":
        return false;
      case "undefined":
        return undefined;
    }
  }

  function doChange() {
    if (!drug.負担区分レコード) {
      drug.負担区分レコード = 負担区分レコードEdit.fromObject({});
    }
    Object.assign(drug.負担区分レコード, {
      第一公費負担区分: decodeValue(kouhi1Value),
      第二公費負担区分: decodeValue(kouhi2Value),
      第三公費負担区分: decodeValue(kouhi3Value),
      特殊公費負担区分: decodeValue(kouhiSpecialValue),
    });
  }
</script>

{#if kouhiSet.kouhi1}
  <div>
    {kouhiRep(kouhiSet.kouhi1.公費負担者番号)}：
    <input
      type="radio"
      bind:group={kouhi1Value}
      value="undefined"
      on:change={doChange}
    />規定
    <input
      type="radio"
      bind:group={kouhi1Value}
      value="true"
      on:change={doChange}
    />適用
    <input
      type="radio"
      bind:group={kouhi1Value}
      value="false"
      on:change={doChange}
    />非適用
  </div>
{/if}
{#if kouhiSet.kouhi2}
  <div>
    {kouhiRep(kouhiSet.kouhi2.公費負担者番号)}：
    <input
      type="radio"
      bind:group={kouhi2Value}
      value="undefined"
      on:change={doChange}
    />規定
    <input
      type="radio"
      bind:group={kouhi2Value}
      value="true"
      on:change={doChange}
    />適用
    <input
      type="radio"
      bind:group={kouhi2Value}
      value="false"
      on:change={doChange}
    />非適用
  </div>
{/if}
{#if kouhiSet.kouhi3}
  <div>
    {kouhiRep(kouhiSet.kouhi3.公費負担者番号)}：
    <input
      type="radio"
      bind:group={kouhi3Value}
      value="undefined"
      on:change={doChange}
    />規定
    <input
      type="radio"
      bind:group={kouhi3Value}
      value="true"
      on:change={doChange}
    />適用
    <input
      type="radio"
      bind:group={kouhi3Value}
      value="false"
      on:change={doChange}
    />非適用
  </div>
{/if}
{#if kouhiSet.kouhiSpecial}
  <div>
    {kouhiRep(kouhiSet.kouhiSpecial.公費負担者番号)}：
    <input
      type="radio"
      bind:group={kouhiSpecialValue}
      value="undefined"
      on:change={doChange}
    />規定
    <input
      type="radio"
      bind:group={kouhiSpecialValue}
      value="true"
      on:change={doChange}
    />適用
    <input
      type="radio"
      bind:group={kouhiSpecialValue}
      value="false"
      on:change={doChange}
    />非適用
  </div>
{/if}
