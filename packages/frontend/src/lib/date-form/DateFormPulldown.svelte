<script lang="ts">
  import { PopupContext } from "../popup-context";
  import { errorMessagesOf, VResult } from "../validation";
  import { ViewportCoord } from "../viewport-coord";
  import DateForm from "./DateForm.svelte";

  export let init: Date | null;
  export let destroy: () => void;
  export let onEnter: (value: Date | null) => void;
  export let event: MouseEvent;
  let context: PopupContext | undefined = undefined;

  let validate: () => VResult<Date | null>;
  let errors: string[] = [];

  function popupDestroy() {
    if (context) {
      context?.destroy();
    }
    destroy();
  }

  function open(e: HTMLElement) {
    const anchor = (event.currentTarget || event.target) as HTMLElement | SVGSVGElement;
    const clickLocation = ViewportCoord.fromEvent(event);
    context = new PopupContext(anchor, e, clickLocation, popupDestroy);
  }

  function doEnter(): void {
    const vs = validate();
    if( vs.isValid ){
      destroy();
      onEnter(vs.value);
      errors = [];
    } else {
      errors = errorMessagesOf(vs.errors);
    }
  }

  function doFormChange(): void {
    const vs = validate();
    if( vs.isValid ){
      errors = [];
    } else {
      errors = errorMessagesOf(vs.errors);
    }
  }
</script>

<div class="menu" use:open>
  {#if errors.length > 0}
  <div class="error">
    {#each errors as e}
      <div>{e}</div>
    {/each}
  </div>
  {/if}
  <DateForm {init} on:value-change={doFormChange} bind:validate/>
  <div class="commands">
    <slot name="aux-commands" />
    <button on:click={doEnter}>入力</button>
    <button on:click={destroy}>キャンセル</button>
  </div>
</div>

<style>
  .menu {
    position: absolute;
    margin: 0;
    padding: 10px;
    box-sizing: border-box;
    border: 1px solid gray;
    background-color: white;
    opacity: 1;
  }

  .menu:focus {
    outline: none;
  }

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
