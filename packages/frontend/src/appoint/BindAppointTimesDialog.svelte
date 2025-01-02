<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import type { AppointTime } from "myclinic-model";
  import { DateWrapper } from "myclinic-util";

  export let destroy: () => void;
  export let onOk: () => void;
  export let appointTime: AppointTime;

  function doOk(): void {
    destroy();
    onOk();
  }
</script>

<Dialog {destroy} title="予約枠の結合">
  <div>以下のように予約枠を結合します。</div>
  <!-- <div>{kanjidate.format("{M}月{D}日（{W}）", appointTime.date)}</div> -->
  <div>{DateWrapper.from(appointTime.date).render(d => `${d.month}月${d.day}日（${d.youbi}）`)}</div>
  <div>{appointTime.fromTime} -- {appointTime.untilTime}</div>
  <div class="commands">
    <button on:click={doOk}>実行</button>
    <button on:click={destroy}>キャンセル</button>
  </div>
</Dialog>

<style>
  .commands {
    display: flex;
    justify-content: right;
  }

  .commands * + * {
    margin-left: 4px;
  }
</style>