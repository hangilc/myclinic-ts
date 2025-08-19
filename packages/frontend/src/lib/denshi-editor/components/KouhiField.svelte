<script lang="ts">
  import { 負担区分レコードEdit, type 薬品情報Edit } from "../denshi-edit";
  import type { KouhiSet } from "../kouhi-set";
  import Field from "./workarea/Field.svelte";
  import FieldTitle from "./workarea/FieldTitle.svelte";
  import FieldForm from "./workarea/FieldForm.svelte";
  import { kouhiRep } from "@/lib/hoken-rep";
  import KouhiForm from "./KouhiForm.svelte";

  export let kouhiSet: KouhiSet;
  export let drug: 薬品情報Edit;
  export let onFieldChange: () => void;

  function futanRep(futan: boolean | undefined): string {
    if (futan === undefined) {
      return "規定";
    } else if (futan) {
      return "適用";
    } else {
      return "不適用";
    }
  }

  function doKouhi1Click() {
    if (!drug.負担区分レコード) {
      drug.負担区分レコード = 負担区分レコードEdit.fromObject({});
    }
    drug.負担区分レコード.isEditing第一公費負担区分 = true;
    drug = drug;
  }

  function doKouhi2Click() {
    if (!drug.負担区分レコード) {
      drug.負担区分レコード = 負担区分レコードEdit.fromObject({});
    }
    drug.負担区分レコード.isEditing第二公費負担区分 = true;
    drug = drug;
  }

  function doKouhi3Click() {
    if (!drug.負担区分レコード) {
      drug.負担区分レコード = 負担区分レコードEdit.fromObject({});
    }
    drug.負担区分レコード.isEditing第三公費負担区分 = true;
    drug = drug;
  }

  function doKouhiSpecialClick() {
    if (!drug.負担区分レコード) {
      drug.負担区分レコード = 負担区分レコードEdit.fromObject({});
    }
    drug.負担区分レコード.isEditing特殊公費負担区分 = true;
    drug = drug;
  }

  function clearEdit() {
    if( drug.負担区分レコード ){
      drug.負担区分レコード.isEditing第一公費負担区分 = false;
      drug.負担区分レコード.isEditing第二公費負担区分 = false;
      drug.負担区分レコード.isEditing第三公費負担区分 = false;
      drug.負担区分レコード.isEditing特殊公費負担区分 = false;
    }

  }

  function doCancelEdit() {
    clearEdit();
  }

  function doEnterEdit() {
    clearEdit();
    onFieldChange();
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
{#if !kouhiSet.isEmpty()}
  <Field>
    <FieldTitle>公費</FieldTitle>
    <FieldForm>
      {#if !drug.負担区分レコード?.isEditing()}
        <div class="rep">
          {#if kouhiSet.kouhi1}
            <span on:click={doKouhi1Click}
              >{kouhiRep(kouhiSet.kouhi1.公費負担者番号)}：{futanRep(
                drug.負担区分レコード?.第一公費負担区分,
              )}</span
            >
          {/if}
          {#if kouhiSet.kouhi2}
            <span on:click={doKouhi2Click}
              >{kouhiRep(kouhiSet.kouhi2.公費負担者番号)}：{futanRep(
                drug.負担区分レコード?.第二公費負担区分,
              )}</span
            >
          {/if}
          {#if kouhiSet.kouhi3}
            <span on:click={doKouhi3Click}
              >{kouhiRep(kouhiSet.kouhi3.公費負担者番号)}：{futanRep(
                drug.負担区分レコード?.第三公費負担区分,
              )}</span
            >
          {/if}
          {#if kouhiSet.kouhiSpecial}
            <span on:click={doKouhiSpecialClick}
              >{kouhiRep(kouhiSet.kouhiSpecial.公費負担者番号)}：{futanRep(
                drug.負担区分レコード?.特殊公費負担区分,
              )}</span
            >
          {/if}
        </div>
      {:else}
        <KouhiForm {kouhiSet} {drug} onCancel={doCancelEdit} onEnter={doEnterEdit}/>
      {/if}
    </FieldForm>
  </Field>
{/if}

<style>
  .rep {
    cursor: pointer;
  }
</style>
