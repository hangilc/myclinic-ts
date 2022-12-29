<script lang="ts">
  import type {
    Appoint as AppointModel,
  } from "myclinic-model";

  export let data: AppointModel;

  function patientText(data: AppointModel): string {
    let a = "";
    if (data.patientId > 0) {
      a = `(${data.patientId}) `;
    }
    return `${a}${data.patientName}`;
  }
</script>

<div>
  <div>
    {patientText(data)}
    {#if data.memoString !== ""}
      （{data.memoString}）
    {/if}
  </div>
  {#if data.tags.length > 0}
    <div>
      {#each data.tags as tag}
        <span>{tag}</span>
      {/each}
    </div>
  {/if}
</div>
