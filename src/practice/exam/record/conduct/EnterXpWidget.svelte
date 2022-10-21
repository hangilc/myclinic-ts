<script lang="ts">
  import Widget from "@/lib/Widget.svelte"

</script>

<Widget title="Ｘ線検査入力" let:close={close}>
  <select>
    <option selected>胸部単純Ｘ線</option>
    <option>腹部単純Ｘ線</option>
  </select>
  <select>
    <option selected>大角</option>
    <option>四ツ切</option>
  </select>
  <svelte:fragment slot="commands">
    <button>入力</button>
    <button on:click={close}>キャンセル</button>
  </svelte:fragment>
</Widget>