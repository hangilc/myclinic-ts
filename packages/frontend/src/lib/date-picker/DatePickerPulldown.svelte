<script lang="ts">
  import SurfacePulldown from "../SurfacePulldown.svelte";
  import DatePicker from "./DatePicker.svelte";

  export let init: Date;
  export let destroy: () => void;
  export let anchor: HTMLElement | SVGSVGElement;
  export let onEnter: (value: Date) => void;

  function doEnter(value: Date): void {
    destroy();
    onEnter(value);
  }
</script>

<SurfacePulldown {anchor} {destroy}>
  <DatePicker {init} onCancel={destroy} onEnter={doEnter}/>
</SurfacePulldown>
