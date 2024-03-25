<script lang="ts">
  import api from "@/lib/api";

  export let patientId: number;
  export let content: string;
  export let onEnter: (newContent: string) => void;
  export let onCancel: () => void;

  async function doEnter() {
    await api.setPatientSummary({ patientId, content });
    onEnter(content);
  }
</script>

<div>
  <textarea bind:value={content}></textarea>
</div>
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="commands">
  <a on:click={doEnter}>入力</a>
  <a on:click={onCancel}>キャンセル</a>
</div>

<style>
  textarea {
    box-sizing: border-box;
    width: 100%;
    height: 10em;
    resize: vertical;
  }
  .commands {
    margin-top: 6px;
    border-top: 1px solid #ccc;
    padding-top: 6px;
  }

  .commands a {
    cursor: pointer;
  }

</style>
