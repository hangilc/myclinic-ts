<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import { AppointTime } from "myclinic-model";
  import * as kanjidate from "kanjidate";
  import api from "@/lib/api";

  export let destroy: () => void;
  export let appointTime: AppointTime;
  let splitValue: string = "";

  function formatDate(date: string): string {
    return kanjidate.format("{M}月{D}日（{W}）", date);
  }

  async function doEnter() {
    let at = splitValue;
    if (/^\d{2}:\d{2}$/.test(at)) {
      at += ":00";
      if (appointTime.fromTime <= at && at <= appointTime.untilTime) {
        const first = Object.assign({}, appointTime, { untilTime: at });
        const second = new AppointTime(
          0,
          appointTime.date,
          at,
          appointTime.untilTime,
          "regular",
          1
        );
        await api.updateAppointTime(first);
        await api.addAppointTime(second);
        destroy();
      }
    }
  }
</script>

<Dialog {destroy} title="予約枠の分割">
  <div>{formatDate(appointTime.date)}</div>
  <div>
    {appointTime.fromTime.substring(0, 5)} - {appointTime.untilTime.substring(
      0,
      5
    )}
  </div>
  <div>
    分割時刻：<input type="text" placeholder="HH:MM" bind:value={splitValue} />
  </div>
  <div class="commands">
    <button on:click={doEnter}>実行</button>
    <button on:click={destroy}>キャンセル</button>
  </div>
</Dialog>
