<script lang="ts">
  import Field from "@/lib/denshi-editor/conv/workarea/Field.svelte";
  import FieldForm from "@/lib/denshi-editor/conv/workarea/FieldForm.svelte";
  import FieldTitle from "@/lib/denshi-editor/conv/workarea/FieldTitle.svelte";
  import type { PrescExampleData } from "../presc-example-data";
  import PencilSquareLink from "@/lib/denshi-editor/icons/PencilSquareLink.svelte";
  import SubmitLink from "@/lib/denshi-editor/icons/SubmitLink.svelte";
  import CancelLink from "@/lib/denshi-editor/icons/CancelLink.svelte";

  export let data: PrescExampleData;

  function doRepClick() {
    data.isEditingComment = true;
    data = data;
  }

  function doEnter() {
    let c = data.commentInput || undefined;
    data.data.comment = c;
    data.isEditingComment = false;
    data = data;
  }

  function doCancelInput() {
    data.commentInput = data.data.comment ?? "";
    data.isEditingComment = false;
    data = data;
  }
</script>

<Field>
  <FieldTitle>コメント</FieldTitle>
  <FieldForm>
    {#if data.isEditingComment}
      <div class="form">
        <textarea bind:value={data.commentInput} />
        <SubmitLink onClick={doEnter} />
        <CancelLink onClick={doCancelInput} />
      </div>
    {:else}
      {data.data.comment ?? "（コメントなし）"}
      <PencilSquareLink onClick={doRepClick} />
    {/if}
  </FieldForm>
</Field>

<style>
  textarea {
    width: 20em;
    height: 4em;
    resize: both;
  }

  .form {
    display: flex;
    align-items: center;
    gap: 6px;
  }
</style>
