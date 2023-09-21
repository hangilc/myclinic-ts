<script lang="ts">
  import { PopupContext } from "../popup-context";
  import { ViewportCoord } from "../viewport-coord";
  import DatePicker from "./DatePicker.svelte";

  export let date: Date;
  export let destroy: () => void;
  export let gengouList: string[];
  export let onEnter: (d: Date) => void;
  export let onCancel: () => void = () => {};
  export let event: MouseEvent;

  event.preventDefault();

  function popupDestroy() {
    if (context) {
      context?.destroy();
    }
    destroy();
  }

  function doEnter(entered: Date) {
    popupDestroy();
    onEnter(entered);
  }

  function doCancel() {
    popupDestroy();
    onCancel();
  }

  let context: PopupContext | undefined = undefined;

  function open(e: HTMLElement) {
    const anchor = (event.currentTarget || event.target) as HTMLElement | SVGSVGElement;
    const clickLocation = ViewportCoord.fromEvent(event);
    context = new PopupContext(anchor, e, clickLocation, popupDestroy);
  }
</script>

<div use:open class="menu">
  <DatePicker {date} {gengouList} onCancel={doCancel} onEnter={doEnter}/>
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

</style>
