<script lang="ts">
  import api from "@/lib/api";
  import { AppointTime } from "myclinic-model";
  import type { AppointTimeData } from "./appoint-time-data";
  import { appointTimeTemplate } from "./appoint-vars";
  import AppointTimeDialog from "./AppointTimeDialog.svelte";
  import OnshiConfirmForDate from "./OnshiConfirmForDate.svelte";

  export let destroy: () => void;
  export let date: string;
  export let siblings: AppointTimeData[];

  async function doAddAppointTime() {
    destroy();
    const tmpl = new AppointTime(0, date, "", "", 
      appointTimeTemplate.kind, appointTimeTemplate.capacity);
    const d: AppointTimeDialog = new AppointTimeDialog({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        title: "新規予約枠",
        data: tmpl,
        siblings,
        onEnter: async (a: AppointTime) => {
          await api.addAppointTime(a);
          Object.assign(appointTimeTemplate, {
            kind: a.kind,
            capacity: a.capacity,
          })
        }
      }
    })
  }

  function doOnshiConfirm() {
    destroy();
    const d: OnshiConfirmForDate = new OnshiConfirmForDate({
      target: document.body,
      props: {
        destroy: () => d.$destroy(),
        date,
        siblings,
      }
    })
  }
</script>

<div class="top">
  <a href="javascript:;" on:click={doAddAppointTime}>予約枠追加</a>
  <a href="javascript:;" on:click={doOnshiConfirm}>資格確認</a>
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
