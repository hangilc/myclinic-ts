<script lang="ts">
  import { range } from "@/lib/range";
  import Dialog from "@/lib/Dialog.svelte";
  import { get, writable, type Writable } from "svelte/store";
  import type { TextCommand } from "./text-commands";
  import SelectItem from "@/lib/SelectItem.svelte";
  import { onDestroy, onMount } from "svelte";

  export let destroy: () => void;
  export let commands: TextCommand[];
  export let onEnter: (t: string) => void;
  let selected: Writable<number> = writable(0);

  function windowKeyDownHandler(event: KeyboardEvent): void {
    if (["ArrowDown", "ArrowUp"].includes(event.key)) {
      event.preventDefault();
    }
  }

  onMount(() => window?.addEventListener("keydown", windowKeyDownHandler));
  onDestroy(() => window?.removeEventListener("keydown", windowKeyDownHandler));

  function doClick(): void {
    destroy();
    let i = get(selected);
    if (i >= 0 && i < commands.length) {
      onEnter(commands[i].body);
    }
  }

  function shiftSelected(n: number): void {
    let i = get(selected);
    let j = i + n;
    console.log("j", j);
    if (j >= 0 && j < commands.length && i !== j) {
      selected.set(j);
    }
  }

  function doKeyDown(event: KeyboardEvent): void {
    console.log("arrow down");
    if (event.key === "ArrowDown") {
      event.preventDefault();
      shiftSelected(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      shiftSelected(-1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      doClick();
    }
  }
</script>

<Dialog {destroy} title="文章入力コマンド" keyDown={doKeyDown} enableAutoFocus={true}>
  <div>
    {#each range(commands.length) as i}
      {@const c = commands[i]}
      <SelectItem on:click={doClick} data={i} {selected}>{c.command}</SelectItem
      >
    {/each}
  </div>
</Dialog>

<style>
</style>
