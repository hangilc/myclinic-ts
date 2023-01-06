<script lang="ts">
  import { AppointTime } from "myclinic-model";
  import type { AppointTimeData } from "./appoint-time-data";
  import AppointTimeDialog from "./AppointTimeDialog.svelte";


  export let destroy: () => void;
  export let date: string;
  export let siblings: AppointTimeData[];

  async function doAddAppointTime() {
    destroy();
    const tmpl = new AppointTime(0, date, "", "", "regular", 1);
    const d: AppointTimeDialog = new AppointTimeDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        title: "新規予約枠",
        data: tmpl,
        siblings,
      }
    })
  }
</script>

<div class="top">
  <a href="javascript:;" on:click={doAddAppointTime}>予約枠追加</a>
</div>

<style>
    .top a {
    display: block;
    margin-bottom: 4px;
  }

  .top a:last-of-type {
    margin-bottom: 0;
  }
</style>