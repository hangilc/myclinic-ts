<script lang="ts">
  import type { Op } from "@/lib/drawer/compiler/op";
  import { drawerToSvg } from "./drawer-svg";
  import { onMount } from "svelte";

  export let ops: Op[];
  export let viewBox: string;
  export let width: string;
  export let height: string;
  export let displayWidth: string | undefined = undefined;
  export let displayHeight: string | undefined = undefined;
  let wrapper: HTMLElement;
  $: refresh(ops);

  export function resize(newWidth: string, newHeight: string): void {
    wrapper.innerHTML = "";
    width = newWidth;
    height = newHeight;
    refresh(ops);
  }

  export function refresh(ops: Op[]): void {
    let option = {
      viewBox,
      width,
      height,
    };
    if (wrapper) {
      wrapper.innerHTML = "";
      wrapper.appendChild(drawerToSvg(ops, option));
    }
  }

  onMount(() => {
    refresh(ops);
  });
</script>

<div
  bind:this={wrapper}
  style:width={displayWidth}
  style:height={displayHeight}
  style:overflow="auto"
/>
