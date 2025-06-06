<script lang="ts">
  import { setFocus } from "@/lib/set-focus";
  import { intSrc, Invalid, strSrc } from "@/lib/validator";
  import { validateAppointTime } from "@/lib/validators/appoint-time-validator";
  import { AppointTime } from "myclinic-model";
  import type { AppointTimeData } from "./appoint-time-data";
  import Dialog from "@/lib/Dialog.svelte";

  export let destroy: () => void;
  export let title: string;
  export let data: AppointTime;
  export let siblings: AppointTimeData[];
  export let onEnter: (a: AppointTime) => void;

  let fromTime: string = "";
  let untilTime: string = "";
  let kind: string = "regular";
  let capacity: string = "1";
  let errors: Invalid[] = [];

  if (data != undefined) {
    fromTime = data.fromTime.substring(0, 5);
    untilTime = data.untilTime.substring(0, 5);
    kind = data.kind;
    capacity = data.capacity.toString();
  }

  function checkConsistentyForUpdate(at: AppointTime): boolean {
    const i = siblings.findIndex(
      (s) => s.appointTime.appointTimeId === at.appointTimeId
    );
    if (i < 0) {
      addError("Internal error: cannot find data");
      return false;
    }
    let j = i - 1;
    if (j >= 0) {
      const other = siblings[j].appointTime;
      if (at.overlapsWith(other)) {
        addError("前の予約枠と時間が重複します。");
        return false;
      }
    }
    j = i + 1;
    if (j < siblings.length) {
      const other = siblings[j].appointTime;
      console.log(at, other);
      if (at.overlapsWith(other)) {
        addError("後の予約枠と時間が重複します。");
        return false;
      }
    }
    const atd = siblings[i];
    if (at.capacity < atd.appoints.length) {
      addError("人数が少なすぎます。");
      return false;
    }
    return true;
  }

  function checkConsitencyForEnter(at: AppointTime): boolean {
    for (let x of siblings) {
      if (x.appointTime.overlapsWith(at)) {
        return false;
      }
    }
    return true;
  }

  function addError(msg: string): void {
    errors = [...errors, new Invalid(msg, [])];
  }

  function doEnter() {
    const result = validateAppointTime(data.appointTimeId, {
      date: strSrc(data.date),
      fromTime: strSrc(fromTime + ":00"),
      untilTime: strSrc(untilTime + ":00"),
      kind: strSrc(kind),
      capacity: intSrc(capacity),
    });
    if (result instanceof AppointTime) {
      let ok = false;
      if (result.appointTimeId === 0) {
        ok = checkConsitencyForEnter(result);
      } else {
        ok = checkConsistentyForUpdate(result);
      }
      if (ok) {
        destroy();
        onEnter(result);
      } else {
        errors = [new Invalid("予約枠の操作に失敗しました", [])]
      }
    } else {
      errors = result;
    }
  }
</script>

<Dialog {destroy} {title}>
  {#if errors.length > 0}
    <div class="error">
      【エラー】
      {#each errors as error}
        <div>{error}</div>
      {/each}
    </div>
  {/if}
  <div class="form">
    <div>
      <div>開始時間</div>
      <div>
        <input
          type="text"
          use:setFocus
          placeholder="HH:MM"
          bind:value={fromTime}
        />
      </div>
    </div>
    <div>
      <div>終了時間</div>
      <div>
        <input type="text" placeholder="HH:MM" bind:value={untilTime} />
      </div>
    </div>
    <div>
      <div>種類</div>
      <div>
        <input type="text" bind:value={kind} />
      </div>
    </div>
    <div>
      <div>人数</div>
      <div>
        <input type="text" bind:value={capacity} />
      </div>
    </div>
  </div>
  <div class="commands">
    <button on:click={doEnter}>入力</button>
    <button on:click={destroy}>キャンセル</button>
  </div>
</Dialog>

<style>
  .error {
    margin: 10px 0;
    color: red;
  }

  .form {
    display: table;
  }

  .form > div {
    display: table-row;
  }

  .form > div > div:first-of-type {
    display: table-cell;
    text-align: right;
    padding: 2px;
  }

  .form > div > div:nth-of-type(2) {
    padding: 2px 0 2px 0px;
    width: 12rem;
  }

  .form > div > div:nth-of-type(2) input {
    margin-left: 6px;
  }

  .commands {
    display: flex;
    justify-content: right;
    align-items: center;
    margin-top: 10px;
    margin-bottom: 4px;
    line-height: 1;
  }

  .commands * + * {
    margin-left: 4px;
  }
</style>
