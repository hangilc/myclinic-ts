<script lang="ts">
  import Field from "@/lib/denshi-editor/conv/workarea/Field.svelte";
  import FieldForm from "@/lib/denshi-editor/conv/workarea/FieldForm.svelte";
  import FieldTitle from "@/lib/denshi-editor/conv/workarea/FieldTitle.svelte";
  import type { PrescExample } from "@/lib/presc-example";

  export let data: PrescExample;
  export let isEditing: boolean;
</script>

<Field>
  <FieldTitle>コメント</FieldTitle>
  <FieldForm>
    {#if !isEditing}
      {data.comment ?? "（なし）"}
    {:else}
    {/if}
  </FieldForm>
</Field>