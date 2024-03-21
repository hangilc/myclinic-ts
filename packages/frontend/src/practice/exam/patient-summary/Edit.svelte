<script lang="ts">
  import api from "@/lib/api";

  export let patientId: number;
  export let content: string;
  export let onEnter: (newContent: string) => void;
  export let onCancel: () => void;

  async function doEnter() {
    await api.enterPatientSummary({ patientId, content });
    onEnter(content);
  }
</script>

<div>
  <textarea bind:value={content}></textarea>
</div>
<div>
  <button on:click={doEnter}>入力</button>
  <button on:click={onCancel}>キャンセル</button>
</div>
