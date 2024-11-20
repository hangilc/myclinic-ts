<script lang="ts">
  import Dialog from "@/lib/Dialog.svelte";
  import { setFocus } from "@/lib/set-focus";

  export let destroy: () => void;
  export let hokengai: string[];
  export let onEnter: (entered: string[]) => void;

  let hokengai1: string = hokengai[0] ?? "";
  let hokengai2: string = hokengai[1] ?? "";
  let hokengai3: string = hokengai[2] ?? "";
  let hokengai4: string = hokengai[3] ?? "";

  async function doEnter() {
    const updated: string[] = [hokengai1, hokengai2, hokengai3, hokengai4].filter(h => h);
    destroy();
    onEnter(updated);
  }

</script>

<Dialog title="保険外" {destroy}>
  <div class="inputs">
    <div class="item">1. <input type="text" bind:value={hokengai1} use:setFocus/></div>
    <div class="item">2. <input type="text" bind:value={hokengai2} /></div>
    <div class="item">3. <input type="text" bind:value={hokengai3} /></div>
    <div class="item">4. <input type="text" bind:value={hokengai4} /></div>
  </div>
  <div class="commands">
    <button on:click={doEnter}>入力</button>
    <button on:click={destroy}>キャンセル</button>
  </div>
</Dialog>

<style>
  .inputs {
    margin-bottom: 10px;
  }

  .inputs .item {
    margin: 4px 0;
  }

  .commands {
    margin: 10px 0;
    text-align: right;
  }
</style>