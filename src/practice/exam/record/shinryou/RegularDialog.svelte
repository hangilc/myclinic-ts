<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import CheckLabel from "@/lib/CheckLabel.svelte";
  import api from "@/lib/api";
  import type { VisitEx } from "@/lib/model"

  export let names: Record<string, string[]>;
  export let visit: VisitEx;
  let dialog: Dialog;

  interface Item {
    name: string;
    checked: boolean;
  }

  let leftItems: Item[] = [];
  let rightItems: Item[] = [];
  let bottomItems: Item[] = [];

  $: {
    leftItems = names.left.map((name) => ({ name, checked: false }));
    rightItems = names.right.map((name) => ({ name: name, checked: false }));
    bottomItems = names.bottom.map((name) => ({ name: name, checked: false }));
  }

  export function open(): void {
    leftItems.forEach((item) => (item.checked = false));
    rightItems.forEach((item) => (item.checked = false));
    bottomItems.forEach((item) => (item.checked = false));
    dialog.open();
  }

  async function doEnter(close: () => void) {
    const at: string = visit.visitedAt.substring(0, 10);
    const selectedNames: string[] = [
      ...leftItems,
      ...rightItems,
      ...bottomItems,
    ]
      .filter((item) => item.checked)
      .map((item) => item.name);
    const codeOpts: (number | null)[] = await Promise.all(
      selectedNames.map(async name => api.resolveShinryouCodeByName(name, at))
    );
    const codes: number[] = [];
    const notFounds: string[] = [];
    for(let i=0;i<selectedNames.length;i++){
      const c = codeOpts[i];
      if( c == null ){
        notFounds.push(selectedNames[i]);
      } else {
        codes.push(c);
      }
    }
    if( notFounds.length !== 0 ){
      alert("Not found: " + notFounds.join(" "));
      return;
    }
    const req = {
      shinryouList: codes.map(c => ({
        shinryouId: 0,
        visitId: visit.visitId,
        shinryoucode: c
      })),
      conducts: []
    }
    await api.batchEnterShinryouConduct(req);
  }
</script>

<Dialog bind:this={dialog} let:close width={null}>
  <span slot="title">診療行為入力</span>
  <div class="two-cols">
    <div class="left">
      {#each leftItems as item}
        {#if item.name.startsWith("---")}
          <div class="leading" />
        {:else}
          <div>
            <CheckLabel
              label={item.name}
              checked={(checked) => (item.checked = checked)}
            />
          </div>
        {/if}
      {/each}
    </div>
    <div class="right">
      {#each rightItems as item}
        {#if item.name.startsWith("---")}
          <div class="leading" />
        {:else}
          <div>
            <CheckLabel
              label={item.name}
              checked={(checked) => (item.checked = checked)}
            />
          </div>
        {/if}
      {/each}
    </div>
    <div class="bottom-wrapper">
      <div class="bottom">
        {#each bottomItems as item}
          <div>
            <CheckLabel
              label={item.name}
              checked={(checked) => (item.checked = checked)}
            />
          </div>
        {/each}
      </div>
    </div>
  </div>
  <svelte:fragment slot="commands">
    <button on:click={() => doEnter(close)}>入力</button>
    <button on:click={close}>キャンセル</button>
  </svelte:fragment>
</Dialog>

<style>
  .two-cols {
    display: grid;
    grid-template-columns: 10em 20em;
  }

  .left {
    padding-right: 5px;
  }

  .leading {
    height: 1em;
  }

  .right {
    padding-left: 5px;
  }

  .bottom-wrapper {
    grid-column-start: 1;
    grid-column-end: 3;
    display: flex;
    justify-content: center;
  }
</style>
