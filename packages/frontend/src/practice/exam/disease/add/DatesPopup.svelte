<script lang="ts">
  
  import api from "@/lib/api";
  import { popupTriggerAsync } from "@/lib/popup-helper";
  import { FormatDate } from "myclinic-util";

  export let patientId: number;
  export let onSelect: (d: Date) => void;
  let dates: Date[] = [];

  async function triggerHook(): Promise<void> {
    if (patientId > 0) {
      const visits = await api.listVisitByPatientReverse(patientId, 0, 10);
      dates = visits.map((v) => new Date(v.visitedAt.substring(0, 10)));
    } else {
      dates = [];
    }
  }

  // function doSelect(date: Date, destroy: () => void): void {
  //   destroy();
  //   onSelect(date);
  // }
</script>

<!-- <Popup let:destroy let:trigger {triggerHook}> -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  class="wrapper"
  on:click={popupTriggerAsync(async () => {
    await triggerHook();
    return dates.map((date) => [
      FormatDate.f1(date),
      () => onSelect(date),
    ]);
  })}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="choice-icon"
    width="1.2em"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
    />
  </svg>
</div>

<!-- <div slot="menu">
  {#each dates as date}
    <SelectItem onSelect={(d) => doSelect(d, destroy)} data={date}>
      <div>{kanjidate.format(kanjidate.f1, date)}</div>
    </SelectItem>
  {/each}
</div> -->

<!-- </Popup> -->

<style>
  .wrapper {
    display: inline-block;
  }

  .choice-icon {
    color: gray;
    cursor: pointer;
  }
</style>
