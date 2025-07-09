<script lang="ts">
  import type { 薬品情報Wrapper } from "../denshi-tmpl";
  import DrugNameField from "./DrugNameField.svelte";
  import Commands from "./workarea/Commands.svelte";
import Title from "./workarea/Title.svelte";
import Workarea from "./workarea/Workarea.svelte";

  export let destroy: () => void;
  export let drug: 薬品情報Wrapper;
  export let at: string;

  let isEdigintName = drug.data.薬品レコード.薬品コード === "";

  function doCancel() {
    destroy();
  }
</script>

<Workarea>
  <Title>薬品編集</Title>
  <DrugNameField {drug} {at} bind:isEditing={isEdigintName}/>
  <Commands>
    <button on:click={doCancel}>キャンセル</button>
  </Commands>
</Workarea>