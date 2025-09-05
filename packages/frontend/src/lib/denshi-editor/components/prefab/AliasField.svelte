<script lang="ts">
  import Field from "../workarea/Field.svelte";
  import FieldTitle from "../workarea/FieldTitle.svelte";
  import FieldForm from "../workarea/FieldForm.svelte";
  import type { AliasEdit } from "@/lib/drug-prefab";
  import AliasFieldEdit from "./AliasFieldEdit.svelte";

  export let alias: AliasEdit[];
  export let onFieldChange: () => void;

  function rep(alias: AliasEdit): string {
    const value = alias.value;
    if (value === "") {
      return "（空白）";
    }
    return value;
  }

  function doRepClick(a: AliasEdit) {
    a.isEditing = true;
    alias = alias;
  }

  function doCancel(a: AliasEdit) {
    a.isEditing = false;
    alias = alias;
  }

  function doDelete(a: AliasEdit) {
    let index = -1;
    for(let i=0;i<alias.length;i++){
      if( alias[i].id === a.id){
        index = i;
        break;
      }
    }
    if( index >= 0 ){
      alias.splice(index, 1);
      alias = alias;
    }
  }

  function doUpdate(a: AliasEdit, value: string) {
    a.value = value;
    a.isEditing = false;
    alias = alias;
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<Field>
  <FieldTitle>薬品別名</FieldTitle>
  <FieldForm>
    {#each alias as a (a.id)}
      {#if a.isEditing}
        <AliasFieldEdit value={a.value} onCancel={() => doCancel(a)} onDelete={() => doDelete(a)}
          onEnter={(value) => doUpdate(a, value)}/>
      {:else}
        <div class="rep" on:click={() => doRepClick(a)}>{rep(a)}</div>
      {/if}
    {/each}
  </FieldForm>
</Field>

<style>
  .rep {
    cursor: pointer;
  }

  .input {
    width: 20em;
  }

  .with-icons {
    display: flex;
    align-items: center;
    gap: 2px;
  }
</style>
