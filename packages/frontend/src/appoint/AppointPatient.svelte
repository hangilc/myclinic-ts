<script lang="ts">
  import type {
    Appoint,
  } from "myclinic-model";
  import type { AppointTimeData } from "./appoint-time-data";
  import AppointDialog from "./AppointDialog.svelte";

  export let data: Appoint;
  export let appointTimeData: AppointTimeData;

  function patientText(data: Appoint): string {
    let a = "";
    if (data.patientId > 0) {
      a = `(${data.patientId}) `;
    }
    return `${a}${data.patientName}`;
  }

  function doClick(): void {
    const d: AppointDialog = new AppointDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        title: "診察予約編集",
        data: appointTimeData,
        init: data
      }
    })
  }
</script>

<div class="top" on:click={doClick} data-cy="appoint-patient"
  data-patient-id={data.patientId}>
  <div>
    {#if data.patientId > 0}
      <span data-cy="patient-id-part">({data.patientId})</span>
    {/if}
    <span data-cy="patient-name-part">{data.patientName}</span>
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

<style>
  .top {
    cursor: pointer;
    user-select: none;
  }
</style>
