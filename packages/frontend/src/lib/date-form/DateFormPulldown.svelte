<script lang="ts">
  import SurfacePulldown from "../SurfacePulldown.svelte";
import DateForm from "./DateForm.svelte";

  export let date: Date | null;
  export let isNullable: boolean = false;
  export let anchor: HTMLElement | SVGSVGElement;
  export let destroy: () => void;
  export let onEnter: (value: Date | null) => void;
  let errors: string[] = [];
  let error: string = "";

  function doEnter(close: () => void): void {
    if (errors.length === 0) {
      if (date === null && !isNullable) {
        errors = ["入力がありません。"];
        error = errors[0];
        return;
      } else {
        close();
        onEnter(date);
      }
    } else {
      error = errors.join("\n");
    }
  }
</script>

<SurfacePulldown let:close {destroy} {anchor} width="auto">
  {#if error !== ""}
    <div class="error">{error}</div>
  {/if}
  <DateForm bind:date bind:errors/>
  <div class="commands">
    <slot name="aux-commands" />
    <button on:click={() => doEnter(close)}>入力</button>
    <button on:click={close}>キャンセル</button>
  </div>
</SurfacePulldown>

<style>
  .error {
    color: red;
    margin-bottom: 6px;
  }

  .commands {
    display: flex;
    justify-content: flex-end;
    margin-top: 4px;
  }

  .commands button {
    margin-left: 4px;
  }
</style>
